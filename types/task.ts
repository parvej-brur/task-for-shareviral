export type TaskStatus = "open" | "done";

export type Category = {
  id: string;
  name: string;
  createdAt: string;
};

// Device-local fields
export type RemoteTask = {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

// App-facing task: backend data plus device-local fields. */
export type Task = RemoteTask & {
  starred: boolean;
};

export type NewTask = {
  title: string;
  description: string;
  categoryId: string | null;
  dueDate: string | null;
};

export type TaskUpdate = Partial<
  Pick<
    RemoteTask,
    "title" | "description" | "categoryId" | "status" | "dueDate"
  >
>;

export type NewCategory = {
  name: string;
};

export type TaskStatusFilter = "all" | TaskStatus;
export type TaskSortKey = "dueDate" | "createdAt";
export type SortDirection = "asc" | "desc";

export type TaskFilters = {
  categoryId: string | null;
  status: TaskStatusFilter;
  search: string;
};

export type TaskSort = {
  key: TaskSortKey;
  direction: SortDirection;
};
