import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  loading: { flex: 1, textAlign: "center", marginTop: spacing.xxl, color: c.mutedForeground },
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    fontSize: typography.sizes.lg + 1,
    fontWeight: "800",
    color: c.foreground,
  },
  scroll: { paddingBottom: spacing.xxl },
  summaryCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: "center",
  },
  summaryLabel: { fontSize: typography.sizes.sm, color: c.mutedForeground },
  summaryAmount: { fontSize: typography.sizes.xxl, fontWeight: "800", color: c.foreground, marginTop: spacing.xs },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  icon: { fontSize: 22, marginRight: spacing.sm, marginTop: 2 },
  info: { flex: 1 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  name: { fontSize: typography.sizes.base, fontWeight: "600", color: c.foreground },
  amount: { fontSize: typography.sizes.base, fontWeight: "700", color: c.foreground },
  track: {
    height: 6,
    backgroundColor: c.surfaceMuted,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: 4,
  },
  fill: { height: 6, borderRadius: radius.full },
  pct: { fontSize: typography.sizes.xs, color: c.mutedForeground },
});
