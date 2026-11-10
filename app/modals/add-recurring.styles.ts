import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  headerBtn: { minWidth: 60, minHeight: 44, justifyContent: 'center' },
  headerTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: c.foreground, textAlign: 'center', flex: 1 },
  cancelText: { fontSize: typography.sizes.md - 1, color: c.mutedForeground },
  saveText: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.bold, color: c.primary, textAlign: 'right' },
  scroll: { padding: 20, gap: 10 },
  fieldLabel: {
    fontSize: 14, fontWeight: typography.weights.semibold, color: c.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm,
  },
  input: {
    backgroundColor: white, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: c.border, paddingHorizontal: 14, paddingVertical: spacing.sm + 4,
    fontSize: typography.sizes.md - 1, color: c.foreground, minHeight: 48,
  },
  inputError: { borderColor: c.error },
  errorText: { fontSize: typography.sizes.xs + 2, color: c.error, marginTop: -4 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pesoSign: { fontSize: 20, fontWeight: typography.weights.bold, color: c.primary },
  chipRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  segmentRow: { flexDirection: 'row', backgroundColor: c.surfaceMuted, borderRadius: radius.md, padding: 3 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md - 2, minHeight: 44, justifyContent: 'center' },
  segmentActive: {
    backgroundColor: white, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  segmentText: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground, fontWeight: typography.weights.medium },
  segmentTextActive: { color: c.foreground, fontWeight: typography.weights.bold },
  dateBtn: {
    backgroundColor: white, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.border,
    paddingHorizontal: spacing.md, paddingVertical: 14, minHeight: 48,
  },
  dateBtnText: { fontSize: typography.sizes.md - 1, color: c.foreground },
  doneDateBtn: { alignItems: 'center', paddingVertical: spacing.sm + 4 },
  doneDateBtnText: { fontSize: typography.sizes.md - 1, color: c.primary, fontWeight: typography.weights.semibold },
});
