import type { RemoteTask, Task } from "@/types/task";

// remoteTasks Tasks from the backend, which have no `starred` property.
export function applyStarred(
  remoteTasks: RemoteTask[],
  starredIds: Set<string>,
): Task[] {
  return remoteTasks.map((task) => ({
    ...task,
    starred: starredIds.has(task.id),
  }));
}
