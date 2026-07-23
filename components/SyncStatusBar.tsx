import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/components/colors";
import { AppFonts } from "@/components/fonts";
import type { SyncStatus } from "@/contexts/tasksReducer";
import { formatRelativeTime } from "@/core/date";
import { Radius, Spacing } from "@/styles/layout";

type SyncStatusBarProps = {
  isOffline: boolean;
  status: SyncStatus;
  lastRefreshedAt: number | null;
  error: string | null;
};

export function SyncStatusBar({
  isOffline,
  status,
  lastRefreshedAt,
  error,
}: SyncStatusBarProps) {
  if (isOffline) {
    return (
      <View style={[styles.bar, styles.offline]}>
        <Ionicons
          name="cloud-offline-outline"
          size={15}
          color={Colors.warning}
        />
        <Text style={[styles.text, { color: Colors.warning }]}>
          Offline — showing saved tasks
        </Text>
      </View>
    );
  }

  if (status === "refreshing") {
    return (
      <View style={styles.bar}>
        <ActivityIndicator size="small" color={Colors.textMuted} />
        <Text style={styles.text}>Syncing…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.bar, styles.error]}>
        <Ionicons name="alert-circle-outline" size={15} color={Colors.danger} />
        <Text style={[styles.text, styles.errorText]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <Ionicons name="cloud-done-outline" size={15} color={Colors.textMuted} />
      <Text style={styles.text}>
        {lastRefreshedAt
          ? `Synced ${formatRelativeTime(lastRefreshedAt)}`
          : "Not synced yet"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceMuted,
    alignSelf: "flex-start",
  },
  offline: {
    backgroundColor: Colors.warningMuted,
  },
  error: {
    backgroundColor: Colors.dangerMuted,
    alignSelf: "stretch",
  },
  text: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  errorText: {
    color: Colors.danger,
    flexShrink: 1,
  },
});
