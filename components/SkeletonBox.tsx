import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';
import { styles } from './SkeletonBox.styles';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.box, { width, height, borderRadius, opacity }, style]}
      accessibilityElementsHidden
    />
  );
}

