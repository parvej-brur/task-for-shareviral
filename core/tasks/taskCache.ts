import { createJSONStore } from "@/core/storage/mmkv";
import type { Category, RemoteTask } from "@/types/task";

const store = createJSONStore("task-manager");

const KEYS = {
  tasks: "tasks",
  categories: "categories",
  starredIds: "starred-ids",
  lastRefreshedAt: "last-refreshed-at",
} as const;

// Local cache of backend data plus the device-local starred set.
export const taskCache = {
  readTasks(): RemoteTask[] | null {
    return store.read<RemoteTask[]>(KEYS.tasks);
  },
  writeTasks(tasks: RemoteTask[]): void {
    store.write(KEYS.tasks, tasks);
  },
  readCategories(): Category[] {
    return store.read<Category[]>(KEYS.categories) ?? [];
  },
  writeCategories(categories: Category[]): void {
    store.write(KEYS.categories, categories);
  },
  readStarredIds(): string[] {
    return store.read<string[]>(KEYS.starredIds) ?? [];
  },
  writeStarredIds(ids: string[]): void {
    store.write(KEYS.starredIds, ids);
  },
  readLastRefreshedAt(): number | null {
    return store.read<number>(KEYS.lastRefreshedAt);
  },
  writeLastRefreshedAt(timestamp: number): void {
    store.write(KEYS.lastRefreshedAt, timestamp);
  },
};
