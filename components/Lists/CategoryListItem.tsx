import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { resolveCategoryColor, Colors } from "@/components/colors";
import { IconTile } from "@/components/customs/IconTile";
import { AppFonts } from "@/components/fonts";
import { Radius, Spacing } from "@/styles/layout";
import type { Category } from "@/types/task";

type CategoryListItemProps = {
  category: Category;
  taskCount: number;
  onPress: (category: Category) => void;
  onDelete?: (category: Category) => void;
};

// Category row
function CategoryListItemComponent({
  category,
  taskCount,
  onPress,
  onDelete,
}: CategoryListItemProps) {
  const { bg, fg } = resolveCategoryColor(category);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${taskCount} tasks`}
      onPress={() => onPress(category)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <IconTile icon="pricetag" color={fg} background={bg} size={44} />
      <Text numberOfLines={1} style={styles.name}>
        {category.name}
      </Text>
      <View style={styles.countChip}>
        <Ionicons name="checkbox-outline" size={13} color={Colors.textMuted} />
        <Text style={styles.countText}>{taskCount}</Text>
      </View>
      {onDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${category.name}`}
          hitSlop={8}
          onPress={() => onDelete(category)}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export const CategoryListItem = memo(CategoryListItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  pressed: {
    backgroundColor: Colors.surfaceSunken,
  },
  name: {
    flex: 1,
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    color: Colors.text,
  },
  countChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
  },
  countText: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  deleteButtonPressed: {
    backgroundColor: Colors.dangerMuted,
  },
});
