import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  emoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: c.foreground,
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: c.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
  },
  modes: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modeOpt: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: c.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  modeOptSelected: {
    borderColor: c.primary,
    backgroundColor: c.primaryTint,
  },
  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  modeEmoji: {
    fontSize: 20,
  },
  modeName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: c.foreground,
  },
  modeDesc: {
    fontSize: typography.sizes.xs,
    color: c.mutedForeground,
    lineHeight: 18,
    paddingLeft: 28,
  },
  btn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: c.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: "#fff",
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
});
