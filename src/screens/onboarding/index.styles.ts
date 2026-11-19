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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    marginBottom: 28,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusCard,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    marginBottom: 12,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } }
      : { elevation: 2 }),
  },
  modeCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandBg,
  },
  iconSlot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modeCardTextGroup: { flex: 1 },
  modeCardTitle: {
    ...typography.modeCardTitle,
    color: colors.navy,
    marginBottom: 2,
  },
  modeCardDesc: {
    fontSize: 13,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    justifyContent: 'center' as const,
    marginTop: 24,
    marginBottom: 20,
  },
  dotActive: {
    width: 20,
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.brand,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.gray2,
  },
  continueButton: {
    backgroundColor: colors.brand,
    borderRadius: spacing.radiusCard,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  continueButtonDisabled: {
    opacity: 0.38,
  },
  continueLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
  },
});
