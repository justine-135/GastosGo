import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  chip: {
    width: "47%",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: c.border,
    borderRadius: 13,
    padding: 13,
  },
  chipSelected: {
    borderColor: c.primary,
    backgroundColor: c.primaryTint,
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  name: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: c.foreground,
  },
  budget: {
    fontSize: typography.sizes.xs,
    color: c.mutedForeground,
  },
});
