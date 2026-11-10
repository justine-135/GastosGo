import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, opacity, white } from '../../theme/index';

const c = colors.light;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scroll: { padding: spacing.md, paddingBottom: 40, gap: 20 },
  screenTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground },
  section: { gap: spacing.sm + 4 },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: c.foreground },
  chartPlaceholder: { alignItems: 'center', paddingVertical: spacing.md },
  skeletonCircle: { alignSelf: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: typography.sizes.base, color: c.mutedForeground, textAlign: 'center' },
  pieWrapper: { alignItems: 'center', justifyContent: 'center' },
  polarChart: { width: 220, height: 220 },
  pieCenter: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
    // pointerEvents="none" set on the View itself
  },
  pieCenterLabel: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  pieCenterAmount: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: c.foreground },
  legend: { gap: spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10 },
  legendRowSelected: { backgroundColor: c.primaryTint },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { flex: 1, fontSize: 14, color: c.foreground, fontWeight: typography.weights.medium },
  legendAmount: { fontSize: 14, fontWeight: typography.weights.semibold, color: c.foreground },
  legendPct: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground, width: 48, textAlign: 'right' },
  sliceDetail: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4, backgroundColor: white,
    borderRadius: 14, padding: 14, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  sliceDetailIcon: { fontSize: 32 },
  sliceDetailName: { fontSize: typography.sizes.md - 1, fontWeight: typography.weights.bold, color: c.foreground },
  sliceDetailAmount: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: c.primary },
  sliceDetailPct: { fontSize: typography.sizes.xs + 2, color: c.mutedForeground },
  sliceDimmed: { opacity: opacity.dim },
  barChart: { flexDirection: 'row', height: 180, alignItems: 'flex-end' },
  barYAxis: { width: 56, justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingRight: spacing.xs },
  barYLabel: { fontSize: 10, color: c.subtleForeground },
  barGroup: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', height: 160 },
  barColumn: { flex: 1, alignItems: 'center', gap: spacing.xs },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 10, borderRadius: radius.sm - 2, minHeight: 2 },
  barLabel: { fontSize: 10, color: c.mutedForeground, marginTop: spacing.xs },
  tooltip: {
    position: 'absolute', top: -48, backgroundColor: c.foreground, borderRadius: radius.sm + 2,
    padding: 6, zIndex: 10,
  },
  tooltipText: { fontSize: 10, color: white },
  barLegendRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center', flexWrap: 'wrap' },
  barLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLegendDot: { width: 10, height: 10, borderRadius: 5 },
  barLegendText: { fontSize: typography.sizes.sm - 1, color: c.mutedForeground },
});

export default styles;
