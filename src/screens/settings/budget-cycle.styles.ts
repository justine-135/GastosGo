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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.screenHPad,
    gap: 14,
  },
  rowBorder: {
    borderTopWidth: 0.5,
    borderTopColor: colors.sep,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    color: colors.navy,
  },
  customInput: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusCard,
    marginHorizontal: spacing.screenHPad,
    paddingVertical: 14,
    paddingHorizontal: spacing.screenHPad,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.navy,
    ...shadows.sm,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.screenHPad,
    marginBottom: 8,
    marginTop: 4,
  },
});
