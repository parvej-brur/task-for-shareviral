import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/components/colors";
import { Button } from "@/components/customs/Button";
import { AppFonts } from "@/components/fonts";
import { Radius, Spacing } from "@/styles/layout";

type EmptyListProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  tone?: "neutral" | "danger";
};

// Centred empty / error / not-found state.
export function EmptyList({
  icon = "file-tray-outline",
  title,
  message,
  actionLabel,
  actionIcon,
  onAction,
  tone = "neutral",
}: EmptyListProps) {
  const isDanger = tone === "danger";
  return (
    <View style={styles.container}>
      <View style={[styles.medallion, isDanger && styles.medallionDanger]}>
        <Ionicons
          name={icon}
          size={30}
          color={isDanger ? Colors.danger : Colors.primary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          icon={actionIcon}
          onPress={onAction}
          variant="ghost"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  medallion: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  medallionDanger: {
    backgroundColor: Colors.dangerMuted,
  },
  title: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: Colors.text,
    textAlign: "center",
  },
  message: {
    fontFamily: AppFonts.body,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 280,
  },
  action: {
    marginTop: Spacing.md,
    minWidth: 160,
  },
});
