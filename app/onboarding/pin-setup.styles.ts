import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: {
    flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between',
    paddingTop: spacing.xl, paddingBottom: 48,
  },
  stepRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { backgroundColor: c.primary, width: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground, textAlign: 'center' },
  subtitle: { fontSize: typography.sizes.base, color: c.mutedForeground, textAlign: 'center' },
  pinRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  pinDot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: c.border, backgroundColor: 'transparent',
  },
  pinDotFilled: { backgroundColor: c.primary, borderColor: c.primary },
  errorText: { fontSize: 14, color: c.error, fontWeight: typography.weights.medium, textAlign: 'center' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm + 4 },
  key: {
    width: '30%', aspectRatio: 1.4, alignItems: 'center', justifyContent: 'center',
    backgroundColor: white, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, minHeight: 56,
  },
  keyInvisible: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyText: { fontSize: typography.sizes.xl, fontWeight: typography.weights.medium, color: c.foreground },
});

export default styles;
