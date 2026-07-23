import { Platform, type ViewStyle } from "react-native";

// Global spacing, radius, and shadow scale shared across screens and components.
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 40,
  xxl: 28,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Shadow: { card: ViewStyle; raised: ViewStyle } = {
  card: Platform.select({
    ios: {
      shadowColor: "#1B3A44",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 1 },
    default: {},
  }) as ViewStyle,
  raised: Platform.select({
    ios: {
      shadowColor: "#0A2A33",
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
};
