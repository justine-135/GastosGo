import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  fill: { flex: 1 },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenHPad,
    paddingTop: spacing.statusBarHeight + 56,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: spacing.statusBarHeight + 8,
    left: spacing.screenHPad,
    padding: 8,
    zIndex: 10,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    color: colors.brand,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    ...typography.onboardingStepTitle,
    color: colors.navy,
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 16,
  },
  inputWrapper: {
    backgroundColor: colors.grayLight,
    borderRadius: spacing.radiusSm,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '300' as const,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    marginRight: 4,
  },
  amountInput: {
    ...typography.amountInput,
    color: colors.navy,
    flex: 1,
    padding: 0,
  },
  dotsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    justifyContent: 'center' as const,
    marginTop: 24,
    marginBottom: 20,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.gray2,
  },
  dotActive: {
    width: 20,
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.brand,
  },
  doneButton: {
    backgroundColor: colors.brand,
    borderRadius: spacing.radiusCard,
    paddingVertical: 16,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  doneButtonDisabled: {
    opacity: 0.38,
  },
  doneLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
  },
});
