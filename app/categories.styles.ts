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
  icon: { fontSize: 22 },
  name: { flex: 1, fontSize: typography.sizes.base, fontWeight: "600", color: c.foreground },
  budgetInput: {
    width: 80,
    textAlign: "right",
    fontSize: typography.sizes.base,
    fontWeight: "700",
    color: c.foreground,
    backgroundColor: c.surfaceInput,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  delBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  delText: { fontSize: 11, color: "#fff", fontWeight: "700" },
});
