import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  tabRow: { flexDirection: 'row', backgroundColor: white, borderBottomWidth: 1, borderBottomColor: c.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: c.primary },
  tabText: { fontSize: typography.sizes.base, color: c.mutedForeground, fontWeight: typography.weights.medium },
  tabTextActive: { color: c.primary, fontWeight: typography.weights.bold },
  filterRowScroll: { borderBottomWidth: 1, borderBottomColor: c.border },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 10 },
  filterChip: { paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.sm, borderRadius: spacing.md, borderWidth: 1.5, borderColor: c.border, minHeight: 36 },
  filterChipActive: { backgroundColor: c.primary, borderColor: c.primary },
  filterChipText: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground, fontWeight: typography.weights.medium },
  filterChipTextActive: { color: white },
  sectionHeader: { backgroundColor: c.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: c.border },
  sectionHeaderText: { fontSize: typography.sizes.xs + 2, fontWeight: typography.weights.bold, color: c.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: { paddingBottom: 80 },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14,
    backgroundColor: white, borderBottomWidth: 1, borderBottomColor: c.borderSoft,
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm + 4 },
  expenseInfo: { flex: 1 },
  expenseMerchant: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: c.foreground },
  expenseSub: { fontSize: 12, color: c.subtleForeground, marginTop: 2 },
  expenseRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  expenseAmount: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: c.foreground },
  deleteBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: typography.sizes.md - 1 },
  recurringRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14,
    backgroundColor: white, borderBottomWidth: 1, borderBottomColor: c.borderSoft,
  },
  recurringMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  badge: { backgroundColor: c.accent, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: c.foreground },
  recurringActions: { alignItems: 'flex-end', gap: spacing.xs },
  paidBtn: { backgroundColor: c.muted, borderRadius: radius.md - 2, paddingHorizontal: 10, paddingVertical: 6 },
  paidBtnText: { fontSize: 12, fontWeight: typography.weights.semibold, color: white },
  skeletonContainer: { gap: 10, paddingTop: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: spacing.sm + 4 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: c.foreground },
  addBtn: { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: spacing.lg, minHeight: 50, justifyContent: 'center' },
  addBtnText: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.semibold, color: white, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 60, height: 60,
    borderRadius: 30, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: c.primary, shadowOffset: { width: 0, height: spacing.xs }, shadowOpacity: 0.4, shadowRadius: spacing.sm, elevation: 8,
  },
  fabText: { fontSize: 30, color: white, lineHeight: 34, marginTop: -2 },
});

export default styles;
