import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type DimensionValue } from "react-native";

import { Colors } from "@/components/colors";
import { Radius, Shadow, Spacing } from "@/styles/layout";

function Block({
  width,
  height,
  radius = 6,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
}) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: Colors.surfaceMuted,
      }}
    />
  );
}

function TaskRowSkeletonComponent() {
  return (
    <View style={styles.card}>
      <Block width={52} height={52} radius={Radius.md} />
      <View style={styles.body}>
        <Block width="68%" height={13} />
        <Block width="42%" height={11} />
        <View style={styles.metaRow}>
          <Block width={78} height={20} radius={Radius.pill} />
          <Block width={64} height={20} radius={Radius.pill} />
        </View>
      </View>
    </View>
  );
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={{ opacity: pulse, gap: Spacing.md }}>
      {Array.from({ length: count }).map((_, index) => (
        <TaskRowSkeletonComponent key={index} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.card,
  },
  body: {
    flex: 1,
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: 2,
  },
});
