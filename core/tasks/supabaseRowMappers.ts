import {
  CATEGORY_COLOR_IDS,
  type Category,
  type CategoryColorId,
  type CategoryUpdate,
  type NewCategory,
  type NewTask,
  type RemoteTask,
  type TaskStatus,
  type TaskUpdate,
} from "@/types/task";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
};

export type CategoryInsert = {
  name: string;
  color: CategoryColorId | null;
};

export type CategoryUpdatePatch = Partial<CategoryInsert>;

/** Columns the client sends; the DB owns id/created_at/updated_at. */
export type TaskInsert = {
  title: string;
  description: string;
  category_id: string | null;
  status: TaskStatus;
  due_date: string | null;
};

export type TaskUpdatePatch = Partial<TaskInsert>;

// The DB has a CHECK constraint, but the client shouldn't trust it blindly.
function toTaskStatus(value: string): TaskStatus {
  return value === "done" ? "done" : "open";
}

function toCategoryColor(value: string | null): CategoryColorId | null {
  return CATEGORY_COLOR_IDS.find((color) => color === value) ?? null;
}

export function toRemoteTask(row: TaskRow): RemoteTask {
  return {
    id: row.id,
    title: row.title,
    // `description` is NOT NULL DEFAULT '' in the schema, but an older row or a
    // hand-written insert can still surface null — the domain type says string.
    description: row.description ?? "",
    categoryId: row.category_id,
    status: toTaskStatus(row.status),
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: toCategoryColor(row.color),
    createdAt: row.created_at,
  };
}

export function toTaskInsert(input: NewTask): TaskInsert {
  return {
    title: input.title,
    description: input.description,
    category_id: input.categoryId,
    status: "open",
    due_date: input.dueDate,
  };
}

export function toCategoryInsert(input: NewCategory): CategoryInsert {
  return { name: input.name, color: input.color ?? null };
}

// Same absent-vs-null discipline as `toTaskUpdate` below.
export function toCategoryUpdate(changes: CategoryUpdate): CategoryUpdatePatch {
  const patch: CategoryUpdatePatch = {};

  if ("name" in changes) patch.name = changes.name;
  if ("color" in changes) patch.color = changes.color;

  return patch;
}

// Builds a partial patch, copying only the keys actually present on `changes`.

export function toTaskUpdate(changes: TaskUpdate): TaskUpdatePatch {
  const patch: TaskUpdatePatch = {};

  if ("title" in changes) patch.title = changes.title;
  if ("description" in changes) patch.description = changes.description;
  if ("categoryId" in changes) patch.category_id = changes.categoryId;
  if ("status" in changes) patch.status = changes.status;
  if ("dueDate" in changes) patch.due_date = changes.dueDate;

  return patch;
}
