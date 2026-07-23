import type { Category, CategoryColorId } from "@/types/task";
import { CATEGORY_COLOR_IDS } from "@/types/task";

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

export const CategorySwatches: Record<
  CategoryColorId,
  { bg: string; fg: string }
> = {
  teal: { bg: "#D8F5F5", fg: "#006A6B" },
  indigo: { bg: "#E0F1FF", fg: "#1D5B92" },
  amber: { bg: "#FBECD9", fg: "#7B4D00" },
  green: { bg: "#E6F3DF", fg: "#3B651F" },
  rose: { bg: "#FFE7E6", fg: "#8B3B3E" },
  violet: { bg: "#F3EAFF", fg: "#674689" },
};

export const CategoryPalette: { bg: string; fg: string }[] =
  CATEGORY_COLOR_IDS.map((id) => CategorySwatches[id]);

export const NeutralTag = { bg: "#EEF2F3", fg: "#5A6B72" } as const;

export function categoryColor(key: string | null | undefined): {
  bg: string;
  fg: string;
} {
  if (!key) return NeutralTag;
  if (key in CategorySwatches) return CategorySwatches[key as CategoryColorId];

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return CategoryPalette[Math.abs(hash) % CategoryPalette.length];
}

// The colour to render for a given category — its chosen swatch, or a stable fallback.
export function resolveCategoryColor(
  category: Pick<Category, "id" | "color"> | null | undefined,
): { bg: string; fg: string } {
  if (!category) return NeutralTag;
  return categoryColor(category.color ?? category.id);
}

//  Suggests the least-used colour so newly created categories don't pile onto one swatch
export function suggestCategoryColor(categories: Category[]): CategoryColorId {
  const usage = new Map<CategoryColorId, number>(
    CATEGORY_COLOR_IDS.map((id) => [id, 0]),
  );
  for (const category of categories) {
    if (category.color)
      usage.set(category.color, (usage.get(category.color) ?? 0) + 1);
  }
  let best: CategoryColorId = CATEGORY_COLOR_IDS[0];
  let bestCount = Infinity;
  for (const id of CATEGORY_COLOR_IDS) {
    const count = usage.get(id) ?? 0;
    if (count < bestCount) {
      best = id;
      bestCount = count;
    }
  }
  return best;
}
