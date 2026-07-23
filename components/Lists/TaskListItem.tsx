import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { resolveCategoryColor, Colors } from "@/components/colors";
import { IconTile } from "@/components/customs/IconTile";
import { MetaPill } from "@/components/customs/MetaPill";
import { StatusChip } from "@/components/customs/StatusChip";
import { Tag } from "@/components/customs/Tag";
import { taskStatusMeta } from "@/components/customs/taskStatus";
import { AppFonts } from "@/components/fonts";
import { formatDate } from "@/core/date";
import { Radius, Shadow, Spacing } from "@/styles/layout";
import type { Category, Task } from "@/types/task";

type TaskListItemProps = {
  task: Task;
  category?: Category;
  onPress: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  onToggleStar: (id: string) => void;
};

function TaskListItemComponent({
  task,
  category,
  onPress,
  onToggleComplete,
  onToggleStar,
}: TaskListItemProps) {
  const isDone = task.status === "done";
  const status = taskStatusMeta(task);
  const { bg, fg } = resolveCategoryColor(category);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={task.title}
      onPress={() => onPress(task.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <IconTile
        icon={category ? "pricetag" : "ellipse-outline"}
        color={fg}
        background={bg}
        done={isDone}
        onPress={() => onToggleComplete(task)}
        accessibilityLabel={isDone ? "Mark task as to do" : "Mark task done"}
      />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={[styles.title, isDone && styles.titleDone]}
          >
            {task.title}
          </Text>
          <StatusChip
            label={status.label}
            color={status.color}
            muted={status.muted}
          />
        </View>

        {task.description ? (
          <Text numberOfLines={1} style={styles.description}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            {category ? <Tag category={category} /> : null}
            <MetaPill
              icon="calendar-outline"
              label={task.dueDate ? formatDate(task.dueDate) : "No due date"}
              muted={!task.dueDate}
              color={task.dueDate ? Colors.accent : Colors.textSubtle}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={task.starred ? "Unstar task" : "Star task"}
            hitSlop={10}
            onPress={() => onToggleStar(task.id)}
            style={styles.starButton}
          >
            <Ionicons
              name={task.starred ? "star" : "star-outline"}
              size={19}
              color={task.starred ? Colors.star : Colors.textSubtle}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export const TaskListItem = memo(TaskListItemComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.card,
  },
  pressed: {
    backgroundColor: Colors.surfaceSunken,
  },
  body: {
    flex: 1,
    gap: 7,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    color: Colors.text,
  },
  titleDone: {
    color: Colors.textSubtle,
    textDecorationLine: "line-through",
  },
  description: {
    fontFamily: AppFonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: -2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 1,
  },
  metaLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  starButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
