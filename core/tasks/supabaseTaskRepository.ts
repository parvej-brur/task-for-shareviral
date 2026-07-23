import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import type {
  Category,
  NewCategory,
  NewTask,
  RemoteTask,
  TaskUpdate,
} from "@/types/task";

import {
  toCategory,
  toCategoryInsert,
  toRemoteTask,
  toTaskInsert,
  toTaskUpdate,
  type CategoryRow,
  type TaskRow,
} from "./supabaseRowMappers";
import type { TaskRepository } from "./taskRepository";

// The Supabase implementation of the backend boundary.
const TASK_COLUMNS =
  "id, title, description, category_id, status, due_date, created_at, updated_at";
const CATEGORY_COLUMNS = "id, name, color, created_at";

function fail(operation: string, error: PostgrestError): never {
  throw new Error(
    `Supabase ${operation} failed: ${error.message} (${error.code})`,
  );
}

export class SupabaseTaskRepository implements TaskRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listTasks(): Promise<RemoteTask[]> {
    const { data, error } = await this.client
      .from("tasks")
      .select(TASK_COLUMNS)
      // Sorting for display happens in `taskSelectors`, on the merged local
      // list — this ordering only makes the payload deterministic.
      .order("created_at", { ascending: false })
      .returns<TaskRow[]>();

    if (error) fail("listTasks", error);
    return (data ?? []).map(toRemoteTask);
  }

  async listCategories(): Promise<Category[]> {
    const { data, error } = await this.client
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .order("created_at", { ascending: true })
      .returns<CategoryRow[]>();

    if (error) fail("listCategories", error);
    return (data ?? []).map(toCategory);
  }

  async createTask(input: NewTask): Promise<RemoteTask> {
    // `.select().single()` so the caller gets the database's version of the row —
    // id, created_at and updated_at are server-generated, and the cache must
    // hold what the backend actually stored, not a client-side guess.
    const { data, error } = await this.client
      .from("tasks")
      .insert(toTaskInsert(input))
      .select(TASK_COLUMNS)
      .single<TaskRow>();

    if (error) fail("createTask", error);
    return toRemoteTask(data);
  }

  async updateTask(id: string, changes: TaskUpdate): Promise<RemoteTask> {
    const patch = toTaskUpdate(changes);

    // An empty patch is a caller bug, but PostgREST answers it with a confusing
    // 400 about a missing body. Reading the row back instead keeps `updateTask`
    // honest about its contract: it always resolves to the current row.
    if (Object.keys(patch).length === 0) {
      return this.getTask(id);
    }

    const { data, error } = await this.client
      .from("tasks")
      .update(patch)
      .eq("id", id)
      .select(TASK_COLUMNS)
      .single<TaskRow>();

    // `.single()` errors when the row is missing, which is what we want: the
    // provider must not write a phantom task into the cache.
    if (error) fail("updateTask", error);
    return toRemoteTask(data);
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.client.from("tasks").delete().eq("id", id);

    if (error) fail("deleteTask", error);
  }

  async createCategory(input: NewCategory): Promise<Category> {
    const { data, error } = await this.client
      .from("categories")
      .insert(toCategoryInsert(input))
      .select(CATEGORY_COLUMNS)
      .single<CategoryRow>();

    if (error) fail("createCategory", error);
    return toCategory(data);
  }

  private async getTask(id: string): Promise<RemoteTask> {
    const { data, error } = await this.client
      .from("tasks")
      .select(TASK_COLUMNS)
      .eq("id", id)
      .single<TaskRow>();

    if (error) fail("getTask", error);
    return toRemoteTask(data);
  }
}
