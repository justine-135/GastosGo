import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  headerBar: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  screenTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground },
  skeletonContainer: { gap: 10, paddingTop: 10 },
  list: { padding: spacing.md, gap: spacing.sm + 4, paddingBottom: 40 },
  row: {
    backgroundColor: white, borderRadius: radius.lg, padding: spacing.md, gap: 10,
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon: { fontSize: 24 },
  catInfo: { flex: 1 },
  catName: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.semibold, color: c.foreground },
  catAmount: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground, marginTop: 2 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  warningIcon: { fontSize: 18 },
  editRow: { flexDirection: 'row', alignItems: 'center' },
  editInput: {
    borderWidth: 1.5, borderColor: c.primary, borderRadius: radius.sm + 2,
    paddingHorizontal: 10, paddingVertical: 6,
    fontSize: typography.sizes.base, color: c.foreground, width: 80, textAlign: 'right', minHeight: 36,
  },
  editBtn: {
    backgroundColor: c.primaryTint, borderRadius: radius.sm + 2,
    paddingHorizontal: 10, paddingVertical: 6, minHeight: 36, justifyContent: 'center',
  },
  editBtnText: { fontSize: typography.sizes.xs + 2, color: c.primary, fontWeight: typography.weights.medium },
  noLimit: { fontSize: typography.sizes.xs + 2, color: c.subtleForeground, fontStyle: 'italic' },
  warningText: { fontSize: typography.sizes.xs + 2, color: c.error, fontWeight: typography.weights.semibold },
  nearText: { fontSize: typography.sizes.xs + 2, color: c.warning, fontWeight: typography.weights.semibold },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: typography.sizes.lg - 2, fontWeight: typography.weights.semibold, color: c.foreground },
  emptySub: { fontSize: typography.sizes.base, color: c.mutedForeground, textAlign: 'center', paddingHorizontal: spacing.lg },
});

export default styles;
