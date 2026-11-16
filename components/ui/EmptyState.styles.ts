import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../theme";

export default StyleSheet.create({
  wrap: {
    alignItems: "center",
    padding: spacing.lg,
  },
  text: {
    fontSize: typography.sizes.sm,
    color: colors.light.mutedForeground,
    textAlign: "center",
  },
});
