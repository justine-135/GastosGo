import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.systemGroupedBg,
  },
  scrollContent: {
    paddingTop: spacing.navBarHeight + 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    color: colors.navy,
    paddingHorizontal: spacing.screenHPad,
    paddingBottom: 20,
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
    borderRadius: 12,
    marginHorizontal: spacing.screenHPad,
    marginBottom: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.screenHPad,
    gap: 14,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.sep,
    marginLeft: spacing.screenHPad + 36 + 14,
  },
  iconSlot: {
    width: 36,
    height: 36,
    borderRadius: spacing.radiusIconSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    color: colors.navy,
  },
  rowSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    marginTop: 1,
  },
  soonBadge: {
    borderRadius: spacing.radiusPill,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: colors.goldBg,
  },
  soonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: colors.gold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  footerLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerAppName: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.navy,
  },
  footerVersion: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
  },
});
