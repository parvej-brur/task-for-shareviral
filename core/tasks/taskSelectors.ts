import type { Task, TaskFilters, TaskGroup, TaskSort } from "@/types/task";

export function filtersForGroup(
  group: TaskGroup,
  categoryId: string | null,
  search: string,
): TaskFilters {
  const base = { categoryId, search };

  switch (group) {
    case "todo":
      return { ...base, status: "open", starred: "unstarred" };
    case "inProgress":
      return { ...base, status: "open", starred: "starred" };
    case "done":
      return { ...base, status: "done", starred: "any" };
    default:
      return { ...base, status: "all", starred: "any" };
  }
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.categoryId !== null && task.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }
    if (filters.starred === "starred" && !task.starred) {
      return false;
    }
    if (filters.starred === "unstarred" && task.starred) {
      return false;
    }
    if (query.length > 0 && !task.title.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });
}

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const direction = sort.direction === "asc" ? 1 : -1;

  return [...tasks].sort((a, b) => {
    if (sort.key === "dueDate") {
      // Tasks without a due date always sink to the bottom, regardless of direction.
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return direction * (Date.parse(a.dueDate) - Date.parse(b.dueDate));
    }
    return direction * (Date.parse(a.createdAt) - Date.parse(b.createdAt));
  });
}

/** Filter + sort in one call — what the Task List actually renders. */
export function selectVisibleTasks(
  tasks: Task[],
  filters: TaskFilters,
  sort: TaskSort,
): Task[] {
  return sortTasks(filterTasks(tasks, filters), sort);
}

export type TaskGroupCounts = Record<TaskGroup, number> & { open: number };

export function countTasksByGroup(tasks: Task[]): TaskGroupCounts {
  let todo = 0;
  let inProgress = 0;
  let done = 0;

  for (const task of tasks) {
    if (task.status === "done") done += 1;
    else if (task.starred) inProgress += 1;
    else todo += 1;
  }

  return { all: tasks.length, todo, inProgress, done, open: todo + inProgress };
}

export function selectFeaturedTask(tasks: Task[]): Task | null {
  let soonest: Task | null = null;
  let soonestDue = Infinity;
  let firstStarred: Task | null = null;
  let firstOpen: Task | null = null;

  for (const task of tasks) {
    if (task.status !== "open") continue;
    if (firstOpen === null) firstOpen = task;
    if (firstStarred === null && task.starred) firstStarred = task;
    if (task.dueDate !== null) {
      const due = Date.parse(task.dueDate);
      if (due < soonestDue) {
        soonestDue = due;
        soonest = task;
      }
    }
  }

  return soonest ?? firstStarred ?? firstOpen ?? tasks[0] ?? null;
}
