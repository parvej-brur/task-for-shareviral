import type { NewTask } from "@/types/task";

export type TaskFormValues = NewTask;

export type TaskFormErrors = Partial<Record<"title", string>>;

export const TITLE_MAX_LENGTH = 80;

export function validateTaskForm(values: { title: string }): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (title.length === 0) {
    errors.title = "Please enter a task name.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Keep the name under ${TITLE_MAX_LENGTH} characters.`;
  }

  return errors;
}

export function hasErrors(errors: TaskFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
