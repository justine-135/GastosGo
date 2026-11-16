import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: c.background,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  icon: {
    fontSize: 17,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: c.foreground,
  },
  meta: {
    fontSize: typography.sizes.xs,
    color: c.mutedForeground,
  },
  amount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: c.foreground,
  },
});
