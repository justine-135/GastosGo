import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scroll: { padding: spacing.md, gap: 20, paddingBottom: 40 },
  screenTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground },
  cardsRow: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, backgroundColor: white, borderRadius: radius.lg, padding: 14, gap: spacing.xs,
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  gapCard: { borderWidth: 2 },
  cardLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: c.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardAmount: { fontSize: typography.sizes.lg + 2, fontWeight: typography.weights.bold, color: c.foreground },
  cardSub: { fontSize: typography.sizes.xs, color: c.subtleForeground },
  positive: { color: c.muted },
  negative: { color: c.error },
  infoBox: {
    backgroundColor: white, borderRadius: radius.lg, padding: 20, gap: 6,
    borderWidth: 1, borderColor: c.border,
  },
  infoTitle: { fontSize: 14, fontWeight: typography.weights.semibold, color: c.mutedForeground, textTransform: 'uppercase' },
  infoAmount: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.primary },
  infoSub: { fontSize: typography.sizes.xs + 2, color: c.subtleForeground },
  section: { gap: spacing.sm + 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: typography.sizes.lg + 2, fontWeight: typography.weights.bold, color: c.foreground },
  addIncomeBtn: { backgroundColor: c.primary, borderRadius: radius.md - 2, paddingHorizontal: 14, paddingVertical: spacing.sm, minHeight: 36 },
  addIncomeBtnText: { fontSize: 14, fontWeight: typography.weights.semibold, color: white },
  addIncomeForm: { backgroundColor: white, borderRadius: radius.lg, padding: spacing.md, gap: 10, borderWidth: 1, borderColor: c.border },
  input: {
    backgroundColor: c.surfaceInput, borderRadius: radius.md - 2, borderWidth: 1.5, borderColor: c.border,
    paddingHorizontal: 14, paddingVertical: spacing.sm + 4, fontSize: typography.sizes.md - 1, color: c.foreground, minHeight: 48,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pesoSign: { fontSize: 20, fontWeight: typography.weights.bold, color: c.primary },
  formActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  cancelBtnText: { fontSize: typography.sizes.base, color: c.mutedForeground },
  saveBtn: { backgroundColor: c.primary, borderRadius: radius.md, paddingHorizontal: 20, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  saveBtnText: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: white },
  breakdown: { backgroundColor: white, borderRadius: radius.lg, padding: spacing.md, gap: 10, borderWidth: 1, borderColor: c.border },
  breakdownTitle: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.bold, color: c.foreground, marginBottom: spacing.xs },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownTotal: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10, marginTop: spacing.xs },
  breakdownLabel: { fontSize: typography.sizes.base, color: c.mutedForeground },
  breakdownLabelBold: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: c.foreground },
  breakdownValue: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: c.foreground },
  breakdownValueBold: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
});
