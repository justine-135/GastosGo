import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingTop: spacing.navBarHeight + 16,
    paddingHorizontal: spacing.screenHPad,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: colors.navy,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    marginBottom: 24,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusCard,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: spacing.radiusIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardTextGroup: {
    flex: 1,
  },
  modeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.navy,
    marginBottom: 2,
  },
  modeCardDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
  },
});
