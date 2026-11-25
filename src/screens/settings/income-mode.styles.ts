import { StyleSheet } from 'react-native';
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
  modeDescription: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    textAlign: 'center',
  },
});
