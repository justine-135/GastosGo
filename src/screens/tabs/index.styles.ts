import { StyleSheet } from 'react-native';
import { colors, shadows, spacing } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingTop: spacing.navBarHeight + 16,
    paddingBottom: 32,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -1,
    marginHorizontal: 20,
    marginBottom: 16,
  },

  gapCard: {
    marginTop: 0,
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.card,
    padding: 24,
    overflow: 'hidden',
    ...shadows.md,
  },
  gapRing: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 22,
    opacity: 0.1,
  },
  gapDot: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.2,
  },
  gapLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gapAmount: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2.5,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  statusPill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gapDescription: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 6,
  },
  detailRows: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 0.5,
    borderTopColor: colors.sep,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.gray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },

  capCard: {
    marginTop: 14,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
    padding: 20,
    overflow: 'hidden',
    ...shadows.sm,
  },
  capArc: {
    position: 'absolute',
    bottom: -70,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 24,
    borderColor: colors.green,
    opacity: 0.08,
  },
  capHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  capCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  capSubLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  capAmountBlock: {
    alignItems: 'flex-end',
  },
  capAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  capOfLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.grayLight,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 0.5,
    borderTopColor: colors.sep,
  },
  catRowFirst: {
    borderTopWidth: 0,
  },
  catEmoji: {
    fontSize: 15,
    marginRight: 8,
  },
  catName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.navy,
    width: 72,
  },
  catBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayLight,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  catBarFill: {
    height: 4,
    borderRadius: 2,
  },
  catRemaining: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
    minWidth: 64,
    textAlign: 'right',
  },

  recentHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  recentCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
    ...shadows.sm,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 12,
  },
  emptyMeta: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  expenseRowSep: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.sep,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseEmoji: {
    fontSize: 18,
  },
  expenseMain: {
    flex: 1,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.navy,
  },
  expenseMeta: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },

  bottomPad: {
    height: 32,
  },
});
