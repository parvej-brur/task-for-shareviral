import { useMemo } from 'react';

import { selectVisibleTasks } from '@/core/tasks/taskSelectors';
import type { Task, TaskFilters, TaskSort } from '@/types/task';

/**
 * Memoised filter + sort. Keeps the work out of the render tree (assessment
 * 4.4) and off the main thread on every keystroke.
 */
export function useFilteredTasks(tasks: Task[], filters: TaskFilters, sort: TaskSort): Task[] {
  return useMemo(() => selectVisibleTasks(tasks, filters, sort), [tasks, filters, sort]);
}
