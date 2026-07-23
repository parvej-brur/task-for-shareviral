import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppFonts } from "@/components/fonts";
import { Radius } from "@/styles/layout";

type StatusChipProps = {
  label: string;
  color: string;
  muted?: string;
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function StatusChip({
  label,
  color,
  muted,
  showDot = true,
  style,
}: StatusChipProps) {
  return (
    <View
      style={[
        styles.chip,
        { borderColor: color, backgroundColor: muted ?? `${color}14` },
        style,
      ]}
    >
      {showDot ? (
        <View style={[styles.dot, { backgroundColor: color }]} />
      ) : null}
      <Text numberOfLines={1} style={[styles.label, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
});
