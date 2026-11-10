import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 48 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { backgroundColor: c.primary, width: 24 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground, marginBottom: spacing.sm },
  subtitle: { fontSize: typography.sizes.base, color: c.mutedForeground, marginBottom: spacing.md },
  list: { gap: spacing.sm + 4, paddingBottom: spacing.lg },
  catRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: white, borderRadius: radius.lg, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
  catIcon: { fontSize: 22 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: c.foreground },
  budgetInput: {
    width: 90, borderWidth: 1.5, borderColor: c.border, borderRadius: radius.md - 2,
    paddingHorizontal: 10, paddingVertical: spacing.sm, fontSize: typography.sizes.base,
    color: c.foreground, textAlign: 'right', minHeight: 44,
  },
  doneBtn: {
    backgroundColor: c.primary, borderRadius: radius.lg, paddingVertical: 18,
    alignItems: 'center', marginVertical: spacing.md, minHeight: 56,
  },
  doneBtnDisabled: { backgroundColor: c.border },
  doneBtnText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: white },
  errorText: { fontSize: 14, color: c.error, fontWeight: typography.weights.medium, textAlign: 'center', marginBottom: spacing.sm },
});

export default styles;
