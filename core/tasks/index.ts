import { MockTaskRepository } from "./mockTaskRepository";
import type { TaskRepository } from "./taskRepository";

// Backend integration point
export const taskRepository: TaskRepository = new MockTaskRepository();

export type { TaskRepository } from "./taskRepository";
