import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  fill: { flex: 1 },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenHPad,
    paddingTop: spacing.statusBarHeight + 32,
    paddingBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: 'rgba(255,99,72,1)',
          shadowOpacity: 0.32,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
        }
      : { elevation: 8 }),
  },
  logoEmoji: { fontSize: 32 },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    color: colors.brand,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  headlineRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    marginBottom: 14,
  },
  headlineText: {
    ...typography.onboardingHeadline,
    color: colors.navy,
    lineHeight: 39,
    textAlign: 'center' as const,
  },
  headlineBrand: {
    ...typography.onboardingHeadline,
    color: colors.brand,
    lineHeight: 39,
  },
  sub: {
    ...typography.body,
    color: colors.gray,
    lineHeight: 24,
    textAlign: 'center' as const,
    marginBottom: 28,
  },
  pillsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginBottom: 40,
  },
  pill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sep,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500' as const,
    fontFamily: 'Inter_500Medium',
    color: colors.navy,
  },
  ctaWrapper: { width: '100%' as const, marginBottom: 14 },
  ctaGradient: {
    borderRadius: 16,
  },
  ctaButton: {
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
  },
  disclaimer: {
    fontSize: 13,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    textAlign: 'center' as const,
  },
});
