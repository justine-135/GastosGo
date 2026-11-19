import { Platform } from 'react-native';

const ios = (color: string, opacity: number, radius: number, offsetY: number) =>
  Platform.OS === 'ios'
    ? { shadowColor: color, shadowOpacity: opacity, shadowRadius: radius, shadowOffset: { width: 0, height: offsetY } }
    : {};

export const shadows = {
  sm: {
    ...ios('#000', 0.07, 10, 2),
    elevation: 2,
  },
  md: {
    ...ios('#000', 0.09, 20, 4),
    elevation: 4,
  },
  lg: {
    ...ios('#000', 0.16, 48, 16),
    elevation: 12,
  },
  fab: {
    ...ios('#4F6EF7', 0.40, 16, 4),
    elevation: 6,
  },
} as const;
