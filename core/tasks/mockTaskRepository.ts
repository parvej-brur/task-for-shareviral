import NetInfo from "@react-native-community/netinfo";

import { createJSONStore } from "@/core/storage/mmkv";
import type {
  Category,
  NewCategory,
  NewTask,
  RemoteTask,
  TaskUpdate,
} from "@/types/task";

import { seedCategories, seedTasks } from "./seed";
import type { TaskRepository } from "./taskRepository";

const store = createJSONStore("mock-backend");

const KEYS = {
  tasks: "tasks",
  categories: "categories",
} as const;

const LATENCY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateRequest(): Promise<void> {
  await delay(LATENCY_MS);
  const state = await NetInfo.fetch();
  if (state.isConnected === false) {
    throw new Error("Network request failed");
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class MockTaskRepository implements TaskRepository {
  constructor() {
    if (store.read<RemoteTask[]>(KEYS.tasks) === null) {
      store.write(KEYS.tasks, seedTasks);
      store.write(KEYS.categories, seedCategories);
    }
  }

  private readTasks(): RemoteTask[] {
    return store.read<RemoteTask[]>(KEYS.tasks) ?? [];
  }

  private readCategories(): Category[] {
    return store.read<Category[]>(KEYS.categories) ?? [];
  }

  async listTasks(): Promise<RemoteTask[]> {
    await simulateRequest();
    return this.readTasks();
  }

  async listCategories(): Promise<Category[]> {
    await simulateRequest();
    return this.readCategories();
  }

  async createTask(input: NewTask): Promise<RemoteTask> {
    await simulateRequest();
    const timestamp = nowIso();
    const task: RemoteTask = {
      id: generateId("task"),
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      status: "open",
      dueDate: input.dueDate,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    store.write(KEYS.tasks, [...this.readTasks(), task]);
    return task;
  }

  async updateTask(id: string, changes: TaskUpdate): Promise<RemoteTask> {
    await simulateRequest();
    const tasks = this.readTasks();
    const existing = tasks.find((task) => task.id === id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }
    const updated: RemoteTask = {
      ...existing,
      ...changes,
      updatedAt: nowIso(),
    };
    store.write(
      KEYS.tasks,
      tasks.map((task) => (task.id === id ? updated : task)),
    );
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await simulateRequest();
    store.write(
      KEYS.tasks,
      this.readTasks().filter((task) => task.id !== id),
    );
  }

  async createCategory(input: NewCategory): Promise<Category> {
    await simulateRequest();
    const category: Category = {
      id: generateId("cat"),
      name: input.name,
      // Matches the DB default: `color` is nullable, and the UI derives a
      // swatch from the id when none is set.
      color: input.color ?? null,
      createdAt: nowIso(),
    };
    store.write(KEYS.categories, [...this.readCategories(), category]);
    return category;
  }
}
