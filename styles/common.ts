import { StyleSheet } from "react-native";

import { Colors } from "@/components/colors";

/** Reusable style fragments shared by multiple screens. */
export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
