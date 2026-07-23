import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { categoryColor } from '@/components/colors';
import { AppFonts } from '@/components/fonts';
import { Radius } from '@/styles/layout';

type TagProps = {
  label: string;
  /** Category key used to pick a stable colour. Omit for the neutral tag. */
  colorKey?: string | null;
  style?: StyleProp<ViewStyle>;
};

/**
 * A solid category tag — the small filled pill used to label a task's category
 * (e.g. the "Piano (test)" tag in the reference). Colour is derived from the
 * category so the same category always reads the same way.
 */
export function Tag({ label, colorKey, style }: TagProps) {
  const { fg } = categoryColor(colorKey);
  return (
    <View style={[styles.tag, { backgroundColor: fg }, style]}>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    maxWidth: 108,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  label: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
});
