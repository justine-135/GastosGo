import { StyleSheet } from 'react-native';
import { colors, spacing, typography, opacity } from '../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  arrow: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: typography.sizes.xl,
    color: c.primary,
    fontWeight: typography.weights.semibold,
  },
  arrowDisabled: { opacity: opacity.dim },
  arrowTextDisabled: { color: c.subtleForeground },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: c.foreground,
    minWidth: 160,
    textAlign: 'center',
  },
});
