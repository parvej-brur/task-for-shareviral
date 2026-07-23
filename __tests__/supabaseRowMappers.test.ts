import { describe, expect, it } from '@jest/globals';

import {
  toCategory,
  toRemoteTask,
  toTaskInsert,
  toTaskUpdate,
  type CategoryRow,
  type TaskRow,
} from '@/core/tasks/supabaseRowMappers';

function makeRow(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: 'task-1',
    title: 'UI Design',
    description: 'Design the home screen.',
    category_id: 'cat-design',
    status: 'open',
    due_date: '2026-07-25T09:00:00.000Z',
    created_at: '2026-07-20T08:00:00.000Z',
    updated_at: '2026-07-20T08:00:00.000Z',
    ...overrides,
  };
}

describe('toRemoteTask', () => {
  it('maps snake_case columns onto the domain shape', () => {
    expect(toRemoteTask(makeRow())).toEqual({
      id: 'task-1',
      title: 'UI Design',
      description: 'Design the home screen.',
      categoryId: 'cat-design',
      status: 'open',
      dueDate: '2026-07-25T09:00:00.000Z',
      createdAt: '2026-07-20T08:00:00.000Z',
      updatedAt: '2026-07-20T08:00:00.000Z',
    });
  });

  it('keeps nullable columns null but coerces a null description to an empty string', () => {
    const task = toRemoteTask(makeRow({ description: null, category_id: null, due_date: null }));
    expect(task.description).toBe('');
    expect(task.categoryId).toBeNull();
    expect(task.dueDate).toBeNull();
  });

  it('falls back to "open" for an unrecognised status', () => {
    expect(toRemoteTask(makeRow({ status: 'archived' })).status).toBe('open');
    expect(toRemoteTask(makeRow({ status: 'done' })).status).toBe('done');
  });

  it('never invents a starred field — that flag is device-local only', () => {
    expect(toRemoteTask(makeRow())).not.toHaveProperty('starred');
  });
});

describe('toCategory', () => {
  it('maps a category row', () => {
    const row: CategoryRow = {
      id: 'cat-design',
      name: 'Design',
      color: 'violet',
      created_at: '2026-07-01T09:00:00.000Z',
    };
    expect(toCategory(row)).toEqual({
      id: 'cat-design',
      name: 'Design',
      color: 'violet',
      createdAt: '2026-07-01T09:00:00.000Z',
    });
  });

  // `color` is free text in Postgres, so a row can carry a swatch this build
  // doesn't know about. Narrowing to null keeps the UI on a valid colour
  // instead of pushing `undefined` into a style.
  it('narrows an unknown or missing colour to null', () => {
    const row: CategoryRow = {
      id: 'cat-misc',
      name: 'Misc',
      color: 'chartreuse',
      created_at: '2026-07-01T09:00:00.000Z',
    };
    expect(toCategory(row).color).toBeNull();
    expect(toCategory({ ...row, color: null }).color).toBeNull();
  });
});

describe('toTaskInsert', () => {
  it('sends new tasks as open and lets the DB own id and timestamps', () => {
    const insert = toTaskInsert({
      title: 'New task',
      description: '',
      categoryId: null,
      dueDate: null,
    });

    expect(insert).toEqual({
      title: 'New task',
      description: '',
      category_id: null,
      status: 'open',
      due_date: null,
    });
    expect(insert).not.toHaveProperty('id');
    expect(insert).not.toHaveProperty('created_at');
  });
});

describe('toTaskUpdate', () => {
  it('includes only the keys that were actually changed', () => {
    expect(toTaskUpdate({ status: 'done' })).toEqual({ status: 'done' });
  });

  // The regression this mapper exists to prevent: mapping every field
  // unconditionally would send `due_date: null` on a title-only edit and wipe
  // the column.
  it('leaves untouched columns out of the patch entirely', () => {
    const patch = toTaskUpdate({ title: 'Renamed' });
    expect(Object.keys(patch)).toEqual(['title']);
    expect('due_date' in patch).toBe(false);
    expect('category_id' in patch).toBe(false);
  });

  it('distinguishes an explicit null from an absent key, so a due date can be cleared', () => {
    const cleared = toTaskUpdate({ dueDate: null });
    expect('due_date' in cleared).toBe(true);
    expect(cleared.due_date).toBeNull();
  });

  it('maps a full edit', () => {
    expect(
      toTaskUpdate({
        title: 'Renamed',
        description: 'Updated',
        categoryId: 'cat-dev',
        status: 'open',
        dueDate: '2026-08-01T09:00:00.000Z',
      }),
    ).toEqual({
      title: 'Renamed',
      description: 'Updated',
      category_id: 'cat-dev',
      status: 'open',
      due_date: '2026-08-01T09:00:00.000Z',
    });
  });
});
