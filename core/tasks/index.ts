import { isSupabaseConfigured } from "@/config/env";

import { MockTaskRepository } from "./mockTaskRepository";
import { createSupabaseClient } from "./supabaseClient";
import { SupabaseTaskRepository } from "./supabaseTaskRepository";
import type { TaskRepository } from "./taskRepository";

function createTaskRepository(): TaskRepository {
  if (!isSupabaseConfigured) {
    if (__DEV__) {
      console.warn(
        "[tasks] No Supabase credentials found; using the local mock backend. " +
          "Copy .env.example to .env to point at a real project.",
      );
    }
    return new MockTaskRepository();
  }

  // Constructing the client parses the URL and throws on a malformed one.
  // Falling back keeps a typo in .env from turning into a blank screen at
  // startup: the app still runs on the mock, and the warning says why.
  try {
    const repository = new SupabaseTaskRepository(createSupabaseClient());
    if (__DEV__) {
      console.log("[tasks] Using the Supabase backend.");
    }
    return repository;
  } catch (error) {
    console.warn(
      "[tasks] Supabase client failed to initialise; using the mock backend.",
      error,
    );
    return new MockTaskRepository();
  }
}

export const taskRepository: TaskRepository = createTaskRepository();

export type { TaskRepository } from "./taskRepository";
