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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.screenHPad,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusCard,
    marginHorizontal: spacing.screenHPad,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.sm,
  },
  fieldRow: {
    paddingVertical: 14,
    paddingHorizontal: spacing.screenHPad,
    borderTopWidth: 0.5,
    borderTopColor: colors.sep,
  },
  fieldRowFirst: {
    borderTopWidth: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.gray,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencyPrefix: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.navy,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.navy,
    paddingVertical: 0,
  },
  destructiveButton: {
    marginHorizontal: spacing.screenHPad,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: spacing.radiusCard,
    backgroundColor: colors.red,
    alignItems: 'center',
  },
  destructiveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.screenHPad,
    marginTop: 12,
  },
  expenseCountText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.navy,
    paddingVertical: 16,
    paddingHorizontal: spacing.screenHPad,
  },
  skipButton: {
    marginHorizontal: spacing.screenHPad,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: spacing.radiusCard,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
  },
  skipButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.navy,
  },
});
