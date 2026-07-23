import { describe, expect, it } from '@jest/globals';

import { initialTasksState, tasksReducer, type TasksState } from '@/contexts/tasksReducer';
import type { RemoteTask } from '@/types/task';

function makeRemoteTask(id: string): RemoteTask {
  return {
    id,
    title: `Task ${id}`,
    description: '',
    categoryId: null,
    status: 'open',
    dueDate: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  };
}

const cachedState: TasksState = {
  ...initialTasksState,
  remoteTasks: [makeRemoteTask('a')],
  starredIds: ['a'],
  lastRefreshedAt: 1000,
};

describe('tasksReducer', () => {
  it('keeps cached tasks on screen when a refresh fails', () => {
    const refreshing = tasksReducer(cachedState, { type: 'refresh/start' });
    const failed = tasksReducer(refreshing, { type: 'refresh/error', error: 'offline' });

    expect(failed.remoteTasks).toEqual(cachedState.remoteTasks);
    expect(failed.status).toBe('idle');
    expect(failed.error).toBe('offline');
  });

  it('replaces tasks but leaves the starred set intact on a successful refresh', () => {
    const next = tasksReducer(cachedState, {
      type: 'refresh/success',
      remoteTasks: [makeRemoteTask('a'), makeRemoteTask('b')],
      categories: [],
      lastRefreshedAt: 2000,
    });

    expect(next.remoteTasks.map((task) => task.id)).toEqual(['a', 'b']);
    expect(next.starredIds).toEqual(['a']);
    expect(next.error).toBeNull();
    expect(next.lastRefreshedAt).toBe(2000);
  });

  it('toggles a starred id on and off', () => {
    const added = tasksReducer(cachedState, { type: 'starred/toggle', id: 'b' });
    expect(added.starredIds).toEqual(['a', 'b']);

    const removed = tasksReducer(added, { type: 'starred/toggle', id: 'a' });
    expect(removed.starredIds).toEqual(['b']);
  });

  it('drops the starred flag when its task is removed', () => {
    const removed = tasksReducer(cachedState, { type: 'task/remove', id: 'a' });
    expect(removed.remoteTasks).toEqual([]);
    expect(removed.starredIds).toEqual([]);
  });

  it('upserts: updates an existing task or appends a new one', () => {
    const updated = tasksReducer(cachedState, {
      type: 'task/upsert',
      task: { ...makeRemoteTask('a'), title: 'Renamed' },
    });
    expect(updated.remoteTasks).toHaveLength(1);
    expect(updated.remoteTasks[0].title).toBe('Renamed');

    const appended = tasksReducer(updated, { type: 'task/upsert', task: makeRemoteTask('c') });
    expect(appended.remoteTasks.map((task) => task.id)).toEqual(['a', 'c']);
  });
});
