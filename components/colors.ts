import type { Category, CategoryColorId } from "@/types/task";

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
  accent: "#3B5BDB", // indigo — dates
  accentMuted: "#E8EDFD",
  warning: "#FF9800", // orange — time / in-progress
  warningMuted: "#FFEFDB",
  success: "#12855A", // green — done
  successMuted: "#E1F3EB",
  danger: "#C93C41", // red — destructive
  dangerMuted: "#FBE9EA",
  star: "#E8A317",

  // Icons / tab bar
  icon: "#68787F",
  tabIconDefault: "#9AA7AD",
  tabIconSelected: teal,
} as const;

export type CategorySwatch = {
  id: CategoryColorId;
  label: string;
  bg: string;
  fg: string;
};

export const CategoryPalette: CategorySwatch[] = [
  { id: "teal", label: "Teal", bg: "#E2F1F3", fg: "#0C5E69" },
  { id: "indigo", label: "Indigo", bg: "#E8EDFD", fg: "#33489E" },
  { id: "amber", label: "Amber", bg: "#FBEED5", fg: "#9C610B" },
  { id: "green", label: "Green", bg: "#E1F3EB", fg: "#0E6C49" },
  { id: "rose", label: "Rose", bg: "#FBE4E8", fg: "#A83544" },
  { id: "violet", label: "Violet", bg: "#EEE7FB", fg: "#5B3FA6" },
];

export const NeutralTag = { bg: "#EEF2F3", fg: "#5A6B72" } as const;

export const CategoryColorOverrides: Record<
  string,
  { bg: string; fg: string }
> = {
  "cat-development": { bg: "#F0F4F8", fg: "#4B6584" },
  development: { bg: "#F0F4F8", fg: "#4B6584" },
};

export function swatchForColorId(color: CategoryColorId | null | undefined) {
  return CategoryPalette.find((swatch) => swatch.id === color);
}

export function categoryColor(key: string | null | undefined): {
  bg: string;
  fg: string;
} {
  if (!key) return NeutralTag;
  const normalizedKey = key.toLowerCase().trim();
  if (CategoryColorOverrides[normalizedKey]) {
    return CategoryColorOverrides[normalizedKey];
  }
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return CategoryPalette[Math.abs(hash) % CategoryPalette.length];
}

export function categorySwatch(
  category: Pick<Category, "id" | "color"> | null | undefined,
): { bg: string; fg: string } {
  if (!category) return NeutralTag;
  return swatchForColorId(category.color) ?? categoryColor(category.id);
}
