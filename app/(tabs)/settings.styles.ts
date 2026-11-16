import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    fontSize: typography.sizes.lg + 1,
    fontWeight: "800",
    color: c.foreground,
  },
  scroll: { paddingBottom: spacing.xxl },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: c.mutedForeground,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    overflow: "hidden",
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  modeLeft: { flex: 1 },
  modeLabel: { fontSize: typography.sizes.base, fontWeight: "600", color: c.foreground },
  modeDesc: { fontSize: typography.sizes.xs, color: c.mutedForeground, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: c.border,
  },
  radioSel: { borderColor: c.primary, backgroundColor: c.primary },
  input: {
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: c.foreground,
  },
  hint: {
    fontSize: typography.sizes.xs,
    color: c.mutedForeground,
    paddingBottom: spacing.sm,
  },
  saveBtn: {
    backgroundColor: c.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontSize: typography.sizes.base, fontWeight: "700" },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  navLabel: { flex: 1, fontSize: typography.sizes.base, color: c.foreground },
  navArrow: { fontSize: typography.sizes.lg, color: c.mutedForeground },
});
