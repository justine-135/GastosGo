import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: c.foreground,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.base,
    color: c.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  button: {
    backgroundColor: c.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: white,
  },
});
