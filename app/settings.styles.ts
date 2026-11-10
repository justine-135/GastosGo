import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, white } from '../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1, borderBottomColor: c.border,
  },
  backBtn: { minWidth: 70, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontSize: typography.sizes.md, color: c.primary },
  screenTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: c.foreground },
  scroll: { padding: spacing.md, gap: spacing.sm },
  sectionHeader: {
    fontSize: typography.sizes.xs + 2, fontWeight: typography.weights.bold, color: c.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: white, borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: c.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 14, minHeight: 52,
  },
  rowBtn: {},
  rowLabel: { fontSize: typography.sizes.md - 1, color: c.foreground, flex: 1 },
  rowValue: { fontSize: typography.sizes.base, color: c.mutedForeground },
  rowAction: { fontSize: typography.sizes.base, color: c.primary, fontWeight: typography.weights.semibold },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chevron: { fontSize: 20, color: c.subtleForeground, marginRight: -4 },
  divider: { height: 1, backgroundColor: c.surfaceMuted, marginHorizontal: spacing.md },
  segmentRow: {
    flexDirection: 'row', backgroundColor: c.surfaceMuted, borderRadius: radius.md - 2,
    padding: 2, flex: 1, maxWidth: 200,
  },
  segment: {
    flex: 1, paddingVertical: spacing.sm, alignItems: 'center',
    borderRadius: radius.sm + 2, minHeight: 36, justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: white, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  segmentText: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground, fontWeight: typography.weights.medium },
  segmentTextActive: { color: c.foreground, fontWeight: typography.weights.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dayPickerSheet: {
    backgroundColor: c.background, borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: 40,
  },
  dayPickerTitle: {
    fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: c.foreground,
    textAlign: 'center', marginBottom: spacing.md,
  },
  dayCell: {
    flex: 1, aspectRatio: 1, margin: spacing.xs, borderRadius: radius.md - 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surfaceMuted, minHeight: 44,
  },
  dayCellActive: { backgroundColor: c.primary },
  dayCellText: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: c.foreground },
  dayCellTextActive: { color: white, fontWeight: typography.weights.bold },
  dayPickerCancel: { marginTop: spacing.md, alignItems: 'center', paddingVertical: 14, minHeight: 48 },
  dayPickerCancelText: { fontSize: typography.sizes.md - 1, color: c.mutedForeground },
});
