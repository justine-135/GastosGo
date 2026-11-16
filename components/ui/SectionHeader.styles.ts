import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../theme";

export default StyleSheet.create({
  text: {
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: 6,
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.light.mutedForeground,
  },
});
