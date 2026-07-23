import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/components/colors";
import { AppFonts } from "@/components/fonts";
import { Radius, Spacing } from "@/styles/layout";

export type FilterOption = { label: string; value: string | null };

type FilterDropdownProps = {
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
};

export function FilterDropdown({
  options,
  value,
  onChange,
  icon = "filter",
  accessibilityLabel = "Filter",
}: FilterDropdownProps) {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; right: number }>({
    top: 0,
    right: Spacing.lg,
  });
  const active = value !== null;

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get("window").width;
      setAnchor({
        top: y + height + 6,
        right: Math.max(Spacing.md, screenWidth - (x + width)),
      });
      setOpen(true);
    });
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={6}
        style={({ pressed }) => [
          styles.trigger,
          active && styles.triggerActive,
          pressed && styles.triggerPressed,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={active ? Colors.primary : Colors.text}
        />
        {active ? <View style={styles.activeDot} /> : null}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { top: anchor.top, right: anchor.right }]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {options.map((option, index) => {
                const selected = option.value === value;
                return (
                  <Pressable
                    key={option.value ?? "__all__"}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      index > 0 && styles.optionDivider,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.optionLabel,
                        selected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color={Colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  activeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 30, 36, 0.18)",
  },
  menu: {
    position: "absolute",
    minWidth: 200,
    maxWidth: 260,
    maxHeight: 300,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xs,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
  },
  optionDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  optionPressed: {
    backgroundColor: Colors.surfaceSunken,
  },
  optionLabel: {
    flex: 1,
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: Colors.textMuted,
  },
  optionLabelSelected: {
    fontFamily: AppFonts.bodyBold,
    color: Colors.text,
  },
});
