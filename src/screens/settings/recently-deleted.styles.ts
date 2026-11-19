import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingTop: spacing.navBarHeight + 16,
    paddingBottom: 40,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    paddingVertical: 16,
    paddingHorizontal: spacing.screenHPad,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusCard,
    marginHorizontal: spacing.screenHPad,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.sm,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.screenHPad,
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.sep,
  },
  expenseRowFirst: {
    borderTopWidth: 0,
  },
  expenseBody: {
    flex: 1,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    color: colors.navy,
  },
  expenseMeta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    marginTop: 1,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.gray,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  restoreButton: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    backgroundColor: colors.brandBg,
    borderRadius: spacing.radiusIconSm,
  },
  restoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.brand,
  },
  deleteButton: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    backgroundColor: colors.redBg,
    borderRadius: spacing.radiusIconSm,
  },
  deleteLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.red,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 40,
    paddingHorizontal: spacing.screenHPad,
  },
});
