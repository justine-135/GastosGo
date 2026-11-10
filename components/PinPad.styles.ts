import { StyleSheet } from 'react-native';
import { colors, spacing, opacity } from '../theme/index';

const c = colors.light;

export const styles = StyleSheet.create({
  grid: { gap: spacing.sm + 4 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyDisabled: { backgroundColor: c.surfaceMuted, opacity: opacity.disabled },
  keyText: { fontSize: 22, fontWeight: '600', color: c.foreground },
  keyTextDisabled: { color: c.subtleForeground },
});
