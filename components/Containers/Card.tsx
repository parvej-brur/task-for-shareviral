import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Colors } from "@/components/colors";
import { Radius, Shadow, Spacing } from "@/styles/layout";

type CardProps = {
  children: React.ReactNode;
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, flush, style }: CardProps) {
  return (
    <View style={[styles.card, flush && styles.flush, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  flush: {
    padding: 0,
  },
});
