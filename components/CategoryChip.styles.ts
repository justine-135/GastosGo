import { StyleSheet } from 'react-native';
import { colors, typography, white } from '../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 44,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: typography.weights.medium, color: c.foreground },
  labelSelected: { color: white },
});
