import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { CategorySwatches, Colors } from "@/components/colors";
import { Spacing } from "@/styles/layout";
import { CATEGORY_COLOR_IDS, type CategoryColorId } from "@/types/task";

type ColorSwatchPickerProps = {
  value: CategoryColorId | null;
  onChange: (color: CategoryColorId) => void;
};

// A row of tappable colour circles for picking a category's colour.
export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  return (
    <View style={styles.row}>
      {CATEGORY_COLOR_IDS.map((id) => {
        const selected = value === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${id} colour`}
            hitSlop={4}
            onPress={() => onChange(id)}
            style={[
              styles.swatch,
              { backgroundColor: CategorySwatches[id].fg },
              selected && styles.swatchSelected,
            ]}
          >
            {selected ? (
              <Ionicons name="checkmark" size={15} color="#fff" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchSelected: {
    borderColor: Colors.text,
  },
});
