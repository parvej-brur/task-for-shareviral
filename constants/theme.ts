/**
 * App colors and fonts. Light theme only — single source of truth for color values.
 * Import `Colors` everywhere instead of hardcoding hex values.
 */

const tintColor = '#0a7ea4';

export const Colors = {
  text: '#11181C',
  background: '#fff',
  tint: tintColor,
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: tintColor,
};

/**
 * App font families loaded in `app/_layout.tsx`.
 * Oswald for headings/titles, Roboto for body text. Reference these instead of
 * hardcoding the raw `fontFamily` strings in screens.
 */
export const AppFonts = {
  // Headings / titles — Oswald
  headingLight: 'Oswald_300Light',
  heading: 'Oswald_400Regular',
  headingMedium: 'Oswald_500Medium',
  headingSemiBold: 'Oswald_600SemiBold',
  headingBold: 'Oswald_700Bold',
  // Body text — Roboto
  bodyThin: 'Roboto_100Thin',
  bodyLight: 'Roboto_300Light',
  body: 'Roboto_400Regular',
  bodyMedium: 'Roboto_500Medium',
  bodyBold: 'Roboto_700Bold',
  bodyBlack: 'Roboto_900Black',
} as const;
