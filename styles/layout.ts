import { Platform, type ViewStyle } from 'react-native';

/** Global spacing, radius, and shadow scale shared across screens and components. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const Shadow: { card: ViewStyle } = {
  card: Platform.select({
    ios: {
      shadowColor: '#0B1B3A',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle,
};
