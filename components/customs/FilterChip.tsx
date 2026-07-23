import { Pressable, StyleSheet, Text } from "react-native";

import { Colors } from "@/components/colors";
import { AppFonts } from "@/components/fonts";
import { Radius, Spacing } from "@/styles/layout";

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipIdle,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    height: 36,
    justifyContent: "center",
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13.5,
    color: Colors.textMuted,
  },
  labelSelected: {
    fontFamily: AppFonts.bodyBold,
    color: "#FFFFFF",
  },
});
