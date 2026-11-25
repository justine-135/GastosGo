import { StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export const styles = StyleSheet.create({
  container: {
    height: spacing.tabBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.sep,
    overflow: 'hidden',
  },
  blurFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250,250,248,0.85)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingBottom: 8,
  },
  tabLabel: {
    color: colors.gray2,
  },
  tabLabelActive: {
    color: colors.brand,
  },
});
