import type { Task, TaskFilters, TaskSort } from "@/types/task";

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.categoryId !== null && task.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.status !== "all" && task.status !== filters.status) {
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

// Filter + sort in one call. Kept out of the render tree (assessment 4.4).
export function selectVisibleTasks(
  tasks: Task[],
  filters: TaskFilters,
  sort: TaskSort,
): Task[] {
  return sortTasks(filterTasks(tasks, filters), sort);
}
