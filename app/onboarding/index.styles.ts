import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white, opacity } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingTop: spacing.xl, paddingBottom: 48 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { backgroundColor: c.primary, width: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emoji: { fontSize: 72 },
  appName: { fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold, color: c.foreground },
  tagline: { fontSize: typography.sizes.lg + 2, textAlign: 'center', color: c.mutedForeground, lineHeight: 28 },
  taglineEn: { fontStyle: 'italic', color: c.primary, fontWeight: typography.weights.medium },
  actions: { gap: spacing.sm + 4 },
  primaryBtn: {
    backgroundColor: c.primary, borderRadius: radius.lg, paddingVertical: 18,
    alignItems: 'center', minHeight: 56,
  },
  primaryBtnText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: white },
  secondaryBtn: {
    borderWidth: 1.5, borderColor: c.secondary, borderRadius: radius.lg, paddingVertical: spacing.md,
    alignItems: 'center', minHeight: 56,
  },
  secondaryBtnText: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.medium, color: c.foreground },
  btnDisabled: { opacity: opacity.disabled },
  restoreMsg: { fontSize: 14, textAlign: 'center', color: c.foreground, paddingHorizontal: spacing.sm },
  restoreMsgError: { color: c.error },
});

export default styles;
