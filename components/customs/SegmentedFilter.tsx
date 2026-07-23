import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/components/colors';
import { AppFonts } from '@/components/fonts';
import { Radius, Spacing } from '@/styles/layout';

export type Segment<T extends string> = {
  key: T;
  label: string;
  count: number;
};

type SegmentedFilterProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (key: T) => void;
};

/**
 * Status filter bar. Scrolls horizontally rather than dividing the width into
 * fixed columns, so a long category name or a narrow screen doesn't squash the
 * labels.
 */
export function SegmentedFilter<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedFilterProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {segments.map((segment) => {
        const active = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${segment.label}, ${segment.count}`}
            onPress={() => onChange(segment.key)}
            style={({ pressed }) => [
              styles.segment,
              active ? styles.segmentActive : styles.segmentIdle,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, active ? styles.labelActive : styles.labelIdle]}>
              {segment.label}
            </Text>
            <View style={[styles.badge, active ? styles.badgeActive : styles.badgeIdle]}>
              <Text style={[styles.count, active ? styles.countActive : styles.countIdle]}>
                {segment.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  segmentIdle: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: 13.5,
  },
  labelIdle: {
    fontFamily: AppFonts.bodyMedium,
    color: Colors.textMuted,
  },
  labelActive: {
    fontFamily: AppFonts.bodyBold,
    color: '#FFFFFF',
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIdle: {
    backgroundColor: Colors.surfaceMuted,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  count: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 12,
  },
  countIdle: {
    color: Colors.textMuted,
  },
  countActive: {
    color: '#FFFFFF',
  },
});
