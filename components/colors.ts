const teal = "#127C8A";

export const Colors = {
  // Text
  text: "#15272E", // primary
  textStrong: "#0B1A20",
  textMuted: "#68787F",
  textSubtle: "#93A1A7",

  // Surfaces
  background: "#F2F5F6",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF2F3",
  surfaceSunken: "#F6F9FA",

  // Lines
  border: "#E4EAEC",
  borderStrong: "#D3DCDF",

  // Brand
  tint: teal,
  primary: teal,
  primaryDark: "#0C5E69",
  primaryMuted: "#E2F1F3",

  // Supporting accents
  accent: "#3B5BDB",
  accentMuted: "#E8EDFD",
  warning: "#FF9800",
  warningMuted: "#FFEFDB",
  success: "#12855A",
  successMuted: "#E1F3EB",
  danger: "#C93C41",
  dangerMuted: "#FBE9EA",
  star: "#E8A317",

  // Icons / tab bar
  icon: "#68787F",
  tabIconDefault: "#9AA7AD",
  tabIconSelected: teal,
} as const;

export const CategoryPalette: { bg: string; fg: string }[] = [
  { bg: "#E2F1F3", fg: "#0C5E69" }, // teal
  { bg: "#E8EDFD", fg: "#33489E" }, // indigo
  { bg: "#FBEED5", fg: "#9C610B" }, // amber
  { bg: "#E1F3EB", fg: "#0E6C49" }, // green
  { bg: "#FBE4E8", fg: "#A83544" }, // rose
  { bg: "#EEE7FB", fg: "#5B3FA6" }, // violet
];

export const NeutralTag = { bg: "#EEF2F3", fg: "#5A6B72" } as const;

export function categoryColor(key: string | null | undefined): {
  bg: string;
  fg: string;
} {
  if (!key) return NeutralTag;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return CategoryPalette[Math.abs(hash) % CategoryPalette.length];
}
