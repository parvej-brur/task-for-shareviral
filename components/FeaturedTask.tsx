import Ionicons from "@expo/vector-icons/Ionicons";
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

type FeaturedTaskProps = {
  task: Task;
  category?: Category;
  onPress: (id: string) => void;
};

export function FeaturedTask({
  task,
  category,
  onPress,
}: FeaturedTaskProps) {
  const isDone = task.status === "done";
  const status = taskStatusMeta(task);
  const { fg } = resolveCategoryColor(category);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Up next: ${task.title}`}
      onPress={() => onPress(task.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrow}>
          <View style={styles.eyebrowIcon}>
            <Ionicons name="alarm" size={12} color={Colors.surface} />
          </View>
          <Text style={styles.eyebrowText}>Up Next</Text>
        </View>

        <StatusChip
          label={status.label}
          color={status.color}
          muted={Colors.surface}
        />
      </View>

      <View style={styles.body}>
        <IconTile
          icon={category ? "pricetag" : "ellipse-outline"}
          color={fg}
          background={Colors.surface}
          size={52}
          done={isDone}
        />
        <View style={styles.text}>
          <Text
            numberOfLines={1}
            style={[styles.title, isDone && styles.titleDone]}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            {category ? <Tag category={category} /> : null}
            <MetaPill
              icon="calendar-outline"
              label={task.dueDate ? formatDate(task.dueDate) : "No due date"}
              muted={!task.dueDate}
              color={task.dueDate ? Colors.accent : Colors.textSubtle}
            />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.primaryDark} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.card,
  },
  pressed: {
    opacity: 0.92,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  eyebrowIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryDark,
  },
  eyebrowText: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 11.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.primaryDark,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  text: {
    flex: 1,
    gap: 7,
  },
  title: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 17,
    color: Colors.text,
  },
  titleDone: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
