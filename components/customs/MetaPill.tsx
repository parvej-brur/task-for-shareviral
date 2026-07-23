import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/components/colors";
import { AppFonts } from "@/components/fonts";

type MetaPillProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  tint?: string;
  muted?: boolean;
};

export function MetaPill({
  icon,
  label,
  color = Colors.accent,
  tint,
  muted,
}: MetaPillProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: tint ?? `${color}1A` }]}>
        <Ionicons name={icon} size={12} color={color} />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.label, muted && styles.labelMuted]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12.5,
    color: Colors.text,
    flexShrink: 1,
  },
  labelMuted: {
    color: Colors.textMuted,
  },
});
