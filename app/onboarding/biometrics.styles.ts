import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingTop: spacing.xl, paddingBottom: 48 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { backgroundColor: c.primary, width: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emoji: { fontSize: 72 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground, textAlign: 'center' },
  subtitle: { fontSize: typography.sizes.md - 1, color: c.mutedForeground, textAlign: 'center', lineHeight: 24 },
  actions: { gap: spacing.sm + 4 },
  primaryBtn: {
    backgroundColor: c.primary, borderRadius: radius.lg, paddingVertical: 18,
    alignItems: 'center', minHeight: 56,
  },
  primaryBtnText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: white },
  skipBtn: {
    borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', minHeight: 56,
    justifyContent: 'center',
  },
  skipBtnText: { fontSize: typography.sizes.md - 1, color: c.mutedForeground },
});

export default styles;
