import type { Category, RemoteTask } from "@/types/task";

export type SyncStatus = "idle" | "refreshing";

export type TasksState = {
  remoteTasks: RemoteTask[];
  starredIds: string[];
  categories: Category[];
  status: SyncStatus;
  lastRefreshedAt: number | null;
  error: string | null;
};

export type TasksAction =
  | { type: "refresh/start" }
  | {
      type: "refresh/success";
      remoteTasks: RemoteTask[];
      categories: Category[];
      lastRefreshedAt: number;
    }
  | { type: "refresh/error"; error: string }
  | { type: "task/upsert"; task: RemoteTask }
  | { type: "task/remove"; id: string }
  | { type: "category/upsert"; category: Category }
  | { type: "category/remove"; id: string }
  | { type: "starred/toggle"; id: string };

export const initialTasksState: TasksState = {
  remoteTasks: [],
  starredIds: [],
  categories: [],
  status: "idle",
  lastRefreshedAt: null,
  error: null,
};

export function tasksReducer(
  state: TasksState,
  action: TasksAction,
): TasksState {
  switch (action.type) {
    case "refresh/start":
      return { ...state, status: "refreshing", error: null };

    case "refresh/success":
      return {
        ...state,
        remoteTasks: action.remoteTasks,
        categories: action.categories,
        lastRefreshedAt: action.lastRefreshedAt,
        status: "idle",
        error: null,
      };

    // Refresh failed: keep the cached data on screen and surface a message.
    case "refresh/error":
      return { ...state, status: "idle", error: action.error };

    case "task/upsert": {
      const exists = state.remoteTasks.some(
        (task) => task.id === action.task.id,
      );
      const remoteTasks = exists
        ? state.remoteTasks.map((task) =>
            task.id === action.task.id ? action.task : task,
          )
        : [...state.remoteTasks, action.task];
      return { ...state, remoteTasks };
    }

    case "task/remove":
      return {
        ...state,
        remoteTasks: state.remoteTasks.filter((task) => task.id !== action.id),
        starredIds: state.starredIds.filter((id) => id !== action.id),
      };

    // Covers both "added" and "recoloured"
    case "category/upsert": {
      const exists = state.categories.some(
        (category) => category.id === action.category.id,
      );
      const categories = exists
        ? state.categories.map((category) =>
            category.id === action.category.id ? action.category : category,
          )
        : [...state.categories, action.category];
      return { ...state, categories };
    }

    case "category/remove":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.id,
        ),
        remoteTasks: state.remoteTasks.map((task) =>
          task.categoryId === action.id ? { ...task, categoryId: null } : task,
        ),
      };

    case "starred/toggle": {
      const starredIds = state.starredIds.includes(action.id)
        ? state.starredIds.filter((id) => id !== action.id)
        : [...state.starredIds, action.id];
      return { ...state, starredIds };
    }

    default:
      return state;
  }
}
