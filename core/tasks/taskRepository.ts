import type {
  Category,
  NewCategory,
  NewTask,
  RemoteTask,
  TaskUpdate,
} from "@/types/task";

// The boundary between the app and the backend.
export interface TaskRepository {
  listTasks(): Promise<RemoteTask[]>;
  createTask(input: NewTask): Promise<RemoteTask>;
  updateTask(id: string, changes: TaskUpdate): Promise<RemoteTask>;
  deleteTask(id: string): Promise<void>;
  listCategories(): Promise<Category[]>;
  createCategory(input: NewCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}
