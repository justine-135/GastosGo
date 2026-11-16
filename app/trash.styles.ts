import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../theme";

const c = colors.light;

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 17, color: c.foreground },
  title: { fontSize: typography.sizes.md, fontWeight: "800", color: c.foreground },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowInfo: { flex: 1 },
  merchant: { fontSize: typography.sizes.base, fontWeight: "600", color: c.foreground },
  date: { fontSize: typography.sizes.xs, color: c.mutedForeground, marginTop: 2 },
  amount: { fontSize: typography.sizes.base, fontWeight: "700", color: c.foreground },
  restoreBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: c.muted,
    borderRadius: radius.sm,
  },
  restoreText: { fontSize: typography.sizes.xs, fontWeight: "600", color: "#fff" },
  purgeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: c.destructive,
    borderRadius: radius.sm,
  },
  purgeText: { fontSize: typography.sizes.xs, fontWeight: "600", color: "#fff" },
});
