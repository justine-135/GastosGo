import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props {
  percent: number; // 0–100+
  height?: number;
}

function barColor(percent: number): string {
  if (percent >= 100) return '#E76F51'; // destructive/red
  if (percent >= 80) return '#E9C46A';  // accent/amber
  return '#81B29A';                     // muted/green
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

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#E5D5C0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});
