import { describe, expect, it } from '@jest/globals';

import { applyStarred } from '@/core/tasks/mergeTasks';
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

describe('applyStarred', () => {
  it('marks tasks whose id is in the starred set', () => {
    const result = applyStarred([makeRemoteTask('a'), makeRemoteTask('b')], new Set(['a']));
    expect(result.find((task) => task.id === 'a')?.starred).toBe(true);
    expect(result.find((task) => task.id === 'b')?.starred).toBe(false);
  });

  it('preserves stars when the backend returns refreshed task data', () => {
    const starred = new Set(['a']);

    // A background refresh delivers a fresh copy of task "a" (e.g. edited title).
    const refreshed: RemoteTask[] = [
      { ...makeRemoteTask('a'), title: 'Edited title' },
      makeRemoteTask('b'),
    ];

    const merged = applyStarred(refreshed, starred);
    const taskA = merged.find((task) => task.id === 'a');
    expect(taskA?.title).toBe('Edited title');
    expect(taskA?.starred).toBe(true);
  });

  it('defaults new tasks from the backend to not starred', () => {
    const merged = applyStarred([makeRemoteTask('new')], new Set(['a']));
    expect(merged[0].starred).toBe(false);
  });
});
