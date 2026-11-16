import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
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
  backArrow: {
    fontSize: 17,
    color: c.foreground,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: c.foreground,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: c.mutedForeground,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  inputWrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: c.mutedForeground,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: spacing.sm + 5,
    fontSize: typography.sizes.base,
    color: c.foreground,
  },
  preview: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  previewLabel: {
    fontSize: typography.sizes.xs,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: c.mutedForeground,
    marginBottom: spacing.sm,
  },
  previewRows: {
    gap: 2,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  previewKey: {
    fontSize: typography.sizes.sm,
    color: c.mutedForeground,
  },
  previewVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: c.foreground,
  },
  previewText: {
    fontSize: typography.sizes.sm,
    color: c.mutedForeground,
    lineHeight: 20,
  },
  previewBold: {
    fontWeight: typography.weights.bold,
    color: c.foreground,
  },
  btn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: c.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
});
