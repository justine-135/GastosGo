import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../theme";

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
  icon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: c.foreground,
    marginBottom: 3,
  },
  pct: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
