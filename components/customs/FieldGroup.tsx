import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/components/colors";
import { AppFonts } from "@/components/fonts";
import { Spacing } from "@/styles/layout";

type FieldGroupProps = {
  label: string;
  children: React.ReactNode;
};

export function FieldGroup({ label, children }: FieldGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.md,
  },
  label: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
});
