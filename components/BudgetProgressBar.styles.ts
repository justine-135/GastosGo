import { StyleSheet } from 'react-native';
import { colors, radius } from '../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  track: {
    backgroundColor: c.border,
    borderRadius: radius.sm - 2,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.sm - 2,
  },
});
