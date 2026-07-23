export type TaskStatus = "open" | "done";

export const CATEGORY_COLOR_IDS = [
  "teal",
  "indigo",
  "amber",
  "green",
  "rose",
  "violet",
] as const;

export type CategoryColorId = (typeof CATEGORY_COLOR_IDS)[number];

export type Category = {
  id: string;
  name: string;

  color: CategoryColorId | null;
  createdAt: string;
};

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

// App-facing task: backend data plus device-local fields.
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
  color?: CategoryColorId | null;
};

export type CategoryUpdate = Partial<Pick<Category, "name" | "color">>;

export type TaskStatusFilter = "all" | TaskStatus;
export type TaskStarredFilter = "any" | "starred" | "unstarred";
export type TaskSortKey = "dueDate" | "createdAt";
export type SortDirection = "asc" | "desc";

export type TaskGroup = "all" | "todo" | "inProgress" | "done";

export type TaskFilters = {
  categoryId: string | null;
  status: TaskStatusFilter;
  // Device-local, so it is a dimension of its own rather than a status.
  starred: TaskStarredFilter;
  search: string;
};

export type TaskSort = {
  key: TaskSortKey;
  direction: SortDirection;
};
