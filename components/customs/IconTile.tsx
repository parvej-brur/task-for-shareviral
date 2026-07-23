import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/components/colors';
import { Radius } from '@/styles/layout';

type IconTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  /** Foreground (icon) colour. */
  color: string;
  /** Tint fill behind the icon. */
  background: string;
  size?: number;
  /** When true, renders a completed treatment (green check) regardless of icon. */
  done?: boolean;
  /** If provided the tile becomes a checkbox-style toggle. */
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Category-tinted leading tile. With `onPress` set it doubles as the completion
 * toggle, which gives the row a tap target big enough to hit without opening
 * the task.
 */
export function IconTile({
  icon,
  color,
  background,
  size = 52,
  done,
  onPress,
  accessibilityLabel,
  style,
}: IconTileProps) {
  const dimensions = { width: size, height: size, borderRadius: Radius.md };
  const content = (
    <View
      style={[
        styles.tile,
        dimensions,
        { backgroundColor: done ? Colors.successMuted : background },
        style,
      ]}>
      <Ionicons
        name={done ? 'checkmark-sharp' : icon}
        size={done ? size * 0.5 : size * 0.44}
        color={done ? Colors.success : color}
      />
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: Boolean(done) }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
