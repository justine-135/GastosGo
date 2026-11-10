import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { styles } from './BudgetProgressBar.styles';
import { colors } from '../theme/index';

interface Props {
  percent: number; // 0–100+
  height?: number;
}

function barColor(percent: number): string {
  if (percent >= 100) return colors.light.destructive;
  if (percent >= 80) return colors.light.accent;
  return colors.light.muted;
}

export function BudgetProgressBar({ percent, height = 8 }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(percent, 100);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [clamped, anim]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View
      style={[styles.track, { height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <Animated.View style={[styles.fill, { width, height, backgroundColor: barColor(percent) }]} />
    </View>
  );
}

