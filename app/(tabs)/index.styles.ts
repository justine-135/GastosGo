import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scroll: { padding: spacing.md, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  greeting: { fontSize: 22, fontWeight: typography.weights.bold, color: c.foreground },
  monthLabel: { fontSize: 14, color: c.mutedForeground, marginTop: 2 },
  settingsBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  widgetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm + 4 },
  card: {
    flex: 1, minWidth: '45%', backgroundColor: white, borderRadius: radius.lg, padding: spacing.md,
    gap: 6, borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardWide: { minWidth: '100%' },
  cardLabel: { fontSize: 12, fontWeight: typography.weights.semibold, color: c.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardAmount: { fontSize: 26, fontWeight: typography.weights.bold, color: c.foreground },
  cardSubtitle: { fontSize: 14, fontWeight: typography.weights.semibold, color: c.foreground },
  cardSub: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground },
  overBudget: { color: c.error },
  positive: { color: c.muted },
  negative: { color: c.error },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billName: { flex: 1, fontSize: typography.sizes.xs + 2, color: c.foreground },
  billAmount: { fontSize: typography.sizes.xs + 2, fontWeight: typography.weights.semibold, color: c.primary },
  section: { gap: spacing.sm + 4 },
  sectionTitle: { fontSize: typography.sizes.lg + 2, fontWeight: typography.weights.bold, color: c.foreground },
  skeletonList: { gap: spacing.sm + 4 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: typography.sizes.lg + 2, fontWeight: typography.weights.semibold, color: c.foreground },
  emptySubtitle: { fontSize: typography.sizes.base, color: c.mutedForeground, textAlign: 'center' },
  ctaBtn: { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  ctaBtnText: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.semibold, color: white },
  transRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4,
    backgroundColor: white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  transInfo: { flex: 1 },
  transMerchant: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: c.foreground },
  transDate: { fontSize: 12, color: c.subtleForeground, marginTop: 2 },
  transAmount: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.bold, color: c.foreground },
  fab: {
    position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 60, height: 60,
    borderRadius: 30, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: c.primary, shadowOffset: { width: 0, height: spacing.xs }, shadowOpacity: 0.4, shadowRadius: spacing.sm, elevation: 8,
  },
  fabText: { fontSize: 30, color: white, lineHeight: 34, marginTop: -2 },
});

export default styles;
