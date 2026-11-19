import { StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export const styles = StyleSheet.create({
  container: {
    height: spacing.navBarHeight,
    justifyContent: 'flex-end',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.sep,
    overflow: 'hidden',
  },
  blurFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250,250,248,0.85)',
  },
  barRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightAction: {
    color: colors.brand,
    minWidth: 40,
    textAlign: 'right',
  },
  rightPlaceholder: {
    width: 40,
  },
});
