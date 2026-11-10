import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scroll: { padding: spacing.lg, paddingBottom: 48, gap: 20 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { backgroundColor: c.primary, width: 24 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground },
  subtitle: { fontSize: typography.sizes.base, color: c.mutedForeground, marginTop: -spacing.sm },
  radioGroup: { gap: spacing.sm + 4 },
  radioCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4,
    backgroundColor: white, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1.5, borderColor: c.border, minHeight: 72,
  },
  radioCardSelected: { borderColor: c.primary, backgroundColor: c.primaryTint },
  radioCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: c.border, alignItems: 'center', justifyContent: 'center',
  },
  radioCircleSelected: { borderColor: c.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary },
  radioText: { flex: 1 },
  radioLabel: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.semibold, color: c.foreground },
  radioDesc: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground, marginTop: 2 },
  inputGroup: { gap: spacing.sm },
  inputLabel: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: c.foreground },
  input: {
    backgroundColor: white, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: c.border, paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: typography.sizes.md, color: c.foreground, minHeight: 52,
  },
  nextBtn: {
    backgroundColor: c.primary, borderRadius: radius.lg, paddingVertical: 18,
    alignItems: 'center', marginTop: spacing.sm, minHeight: 56,
  },
  nextBtnDisabled: { backgroundColor: c.border },
  nextBtnText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: white },
});

export default styles;
