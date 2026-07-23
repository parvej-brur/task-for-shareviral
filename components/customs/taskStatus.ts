import type Ionicons from "@expo/vector-icons/Ionicons";

import { Colors } from "@/components/colors";
import type { Task } from "@/types/task";

export type TaskStatusMeta = {
  label: string;
  color: string;
  muted: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function taskStatusMeta(
  task: Pick<Task, "status" | "starred">,
): TaskStatusMeta {
  if (task.status === "done") {
    return {
      label: "Done",
      color: Colors.success,
      muted: Colors.successMuted,
      icon: "checkmark-circle",
    };
  }
  if (task.starred) {
    return {
      label: "In progress",
      color: Colors.warning,
      muted: Colors.warningMuted,
      icon: "ellipse",
    };
  }
  return {
    label: "To do",
    color: Colors.primary,
    muted: Colors.primaryMuted,
    icon: "ellipse-outline",
  };
}
