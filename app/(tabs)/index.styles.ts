import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  loading: {
    flex: 1,
    textAlign: "center",
    marginTop: spacing.xxl,
    color: c.mutedForeground,
  },
  greeting: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 2,
    fontSize: typography.sizes.lg + 1,
    fontWeight: "800",
    color: c.foreground,
  },
  sub: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    fontSize: typography.sizes.xs,
    color: c.mutedForeground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 88 + spacing.lg,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});
