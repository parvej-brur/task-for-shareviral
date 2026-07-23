import { describe, expect, it } from '@jest/globals';

import {
  countTasksByGroup,
  filterTasks,
  filtersForGroup,
  selectFeaturedTask,
  selectVisibleTasks,
  sortTasks,
} from '@/core/tasks/taskSelectors';
import type { Task, TaskFilters, TaskSort } from '@/types/task';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't',
    title: 'Task',
    description: '',
    categoryId: null,
    status: 'open',
    dueDate: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    starred: false,
    ...overrides,
  };
}

const baseFilters: TaskFilters = {
  categoryId: null,
  status: 'all',
  starred: 'any',
  search: '',
};
const byDueAsc: TaskSort = { key: 'dueDate', direction: 'asc' };

describe('filterTasks', () => {
  const tasks = [
    makeTask({ id: 'a', title: 'Design system', categoryId: 'design', status: 'open' }),
    makeTask({ id: 'b', title: 'API integration', categoryId: 'dev', status: 'done' }),
    makeTask({ id: 'c', title: 'Design review', categoryId: 'design', status: 'done' }),
  ];

  it('filters by category', () => {
    const result = filterTasks(tasks, { ...baseFilters, categoryId: 'design' });
    expect(result.map((task) => task.id)).toEqual(['a', 'c']);
  });

  it('filters by status', () => {
    const result = filterTasks(tasks, { ...baseFilters, status: 'open' });
    expect(result.map((task) => task.id)).toEqual(['a']);
  });

  it('searches by title, case-insensitively and trimmed', () => {
    const result = filterTasks(tasks, { ...baseFilters, search: '  DESIGN ' });
    expect(result.map((task) => task.id)).toEqual(['a', 'c']);
  });

  it('combines category, status and search', () => {
    const result = filterTasks(tasks, {
      ...baseFilters,
      categoryId: 'design',
      status: 'done',
      search: 'review',
    });
    expect(result.map((task) => task.id)).toEqual(['c']);
  });

  it('filters on the device-local starred flag independently of status', () => {
    const mixed = [
      makeTask({ id: 'open-starred', status: 'open', starred: true }),
      makeTask({ id: 'open-plain', status: 'open', starred: false }),
      makeTask({ id: 'done-starred', status: 'done', starred: true }),
    ];

    expect(
      filterTasks(mixed, { ...baseFilters, starred: 'starred' }).map((task) => task.id),
    ).toEqual(['open-starred', 'done-starred']);
    expect(
      filterTasks(mixed, { ...baseFilters, starred: 'unstarred' }).map((task) => task.id),
    ).toEqual(['open-plain']);
  });
});

describe('filtersForGroup', () => {
  // The Task List's segments are UI sugar over two independent dimensions.
  // Decomposing them here is what keeps `.filter()` chains out of the screen.
  it('maps each segment onto plain status + starred filters', () => {
    expect(filtersForGroup('all', null, '')).toMatchObject({ status: 'all', starred: 'any' });
    expect(filtersForGroup('todo', null, '')).toMatchObject({
      status: 'open',
      starred: 'unstarred',
    });
    expect(filtersForGroup('inProgress', null, '')).toMatchObject({
      status: 'open',
      starred: 'starred',
    });
    expect(filtersForGroup('done', null, '')).toMatchObject({ status: 'done', starred: 'any' });
  });

  it('carries the category and search term through unchanged', () => {
    expect(filtersForGroup('todo', 'design', 'audit')).toEqual({
      categoryId: 'design',
      search: 'audit',
      status: 'open',
      starred: 'unstarred',
    });
  });

  it('partitions the list: every task lands in exactly one segment', () => {
    const tasks = [
      makeTask({ id: 'a', status: 'open', starred: false }),
      makeTask({ id: 'b', status: 'open', starred: true }),
      makeTask({ id: 'c', status: 'done', starred: true }),
    ];

    const ids = (['todo', 'inProgress', 'done'] as const).flatMap((group) =>
      filterTasks(tasks, filtersForGroup(group, null, '')).map((task) => task.id),
    );

    expect(ids.sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('countTasksByGroup', () => {
  it('counts each segment, with open covering both to-do and in-progress', () => {
    const tasks = [
      makeTask({ id: 'a', status: 'open', starred: false }),
      makeTask({ id: 'b', status: 'open', starred: false }),
      makeTask({ id: 'c', status: 'open', starred: true }),
      makeTask({ id: 'd', status: 'done', starred: false }),
    ];

    expect(countTasksByGroup(tasks)).toEqual({
      all: 4,
      todo: 2,
      inProgress: 1,
      done: 1,
      open: 3,
    });
  });

  it('counts an empty list as all zeroes', () => {
    expect(countTasksByGroup([])).toEqual({ all: 0, todo: 0, inProgress: 0, done: 0, open: 0 });
  });
});

describe('selectFeaturedTask', () => {
  it('prefers the nearest upcoming due date among open tasks', () => {
    const tasks = [
      makeTask({ id: 'late', status: 'open', dueDate: '2026-07-30T00:00:00.000Z' }),
      makeTask({ id: 'early', status: 'open', dueDate: '2026-07-10T00:00:00.000Z' }),
      makeTask({ id: 'sooner-but-done', status: 'done', dueDate: '2026-07-01T00:00:00.000Z' }),
    ];
    expect(selectFeaturedTask(tasks)?.id).toBe('early');
  });

  it('falls back to a starred open task, then any open task', () => {
    const starred = [
      makeTask({ id: 'plain', status: 'open' }),
      makeTask({ id: 'starred', status: 'open', starred: true }),
    ];
    expect(selectFeaturedTask(starred)?.id).toBe('starred');

    const openOnly = [makeTask({ id: 'done', status: 'done' }), makeTask({ id: 'open' })];
    expect(selectFeaturedTask(openOnly)?.id).toBe('open');
  });

  it('returns null for an empty list', () => {
    expect(selectFeaturedTask([])).toBeNull();
  });
});

describe('sortTasks', () => {
  const tasks = [
    makeTask({ id: 'none', dueDate: null }),
    makeTask({ id: 'late', dueDate: '2026-07-30T00:00:00.000Z' }),
    makeTask({ id: 'early', dueDate: '2026-07-10T00:00:00.000Z' }),
  ];

  it('sorts by due date ascending with undated tasks last', () => {
    const result = sortTasks(tasks, byDueAsc);
    expect(result.map((task) => task.id)).toEqual(['early', 'late', 'none']);
  });

  it('sorts by due date descending but still keeps undated tasks last', () => {
    const result = sortTasks(tasks, { key: 'dueDate', direction: 'desc' });
    expect(result.map((task) => task.id)).toEqual(['late', 'early', 'none']);
  });

  it('sorts by created time', () => {
    const created = [
      makeTask({ id: 'old', createdAt: '2026-07-01T00:00:00.000Z' }),
      makeTask({ id: 'new', createdAt: '2026-07-20T00:00:00.000Z' }),
    ];
    expect(sortTasks(created, { key: 'createdAt', direction: 'desc' }).map((t) => t.id)).toEqual([
      'new',
      'old',
    ]);
  });

  it('does not mutate the input array', () => {
    const input = [...tasks];
    sortTasks(input, byDueAsc);
    expect(input.map((task) => task.id)).toEqual(['none', 'late', 'early']);
  });
});

describe('selectVisibleTasks', () => {
  it('filters then sorts', () => {
    const tasks = [
      makeTask({ id: 'a', status: 'open', dueDate: '2026-07-20T00:00:00.000Z' }),
      makeTask({ id: 'b', status: 'done', dueDate: '2026-07-05T00:00:00.000Z' }),
      makeTask({ id: 'c', status: 'open', dueDate: '2026-07-10T00:00:00.000Z' }),
    ];
    const result = selectVisibleTasks(tasks, { ...baseFilters, status: 'open' }, byDueAsc);
    expect(result.map((task) => task.id)).toEqual(['c', 'a']);
  });
});
