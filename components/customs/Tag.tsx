import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { resolveCategoryColor } from "@/components/colors";
import { AppFonts } from "@/components/fonts";
import { Radius } from "@/styles/layout";
import type { Category } from "@/types/task";

type TagProps = {
  category: Category;
  style?: StyleProp<ViewStyle>;
};

export function Tag({ category, style }: TagProps) {
  const { fg } = resolveCategoryColor(category);
  return (
    <View style={[styles.tag, { backgroundColor: fg }, style]}>
      <Text numberOfLines={1} style={styles.label}>
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    maxWidth: 108,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  label: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
});
