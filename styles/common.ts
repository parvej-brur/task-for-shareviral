import { StyleSheet } from "react-native";

import { AppFonts, Colors } from "@/constants/theme";

import { Radius, Shadow, Spacing } from "./layout";

/** Reusable style fragments shared by multiple screens and components. */
export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: AppFonts.body,
    fontSize: 15,
    color: Colors.text,
  },
  fieldLabel: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: Colors.text,
  },
  helperText: {
    fontFamily: AppFonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
});
