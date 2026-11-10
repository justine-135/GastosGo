import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
  appName: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: c.primary },
  header: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: c.foreground, textAlign: 'center' },
  dotsRow: { flexDirection: 'row', gap: spacing.md },
  pinDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: c.border, backgroundColor: 'transparent',
  },
  pinDotFilled: { backgroundColor: c.primary, borderColor: c.primary },
  error: { fontSize: 14, color: c.error, textAlign: 'center' },
  lockout: { fontSize: typography.sizes.base, color: c.error, fontWeight: typography.weights.semibold },
  hint: { fontSize: typography.sizes.xs + 2, color: c.subtleForeground, textAlign: 'center', marginTop: spacing.sm },
});
