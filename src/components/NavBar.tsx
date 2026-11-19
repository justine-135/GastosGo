import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { colors, typography } from '../theme';
import { styles } from './NavBar.styles';

interface NavBarProps {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRight?: () => void;
}

export function NavBar({ title, onBack, rightLabel, onRight }: NavBarProps) {
  const backScale = useRef(new Animated.Value(1)).current;
  const rightOpacity = useRef(new Animated.Value(1)).current;

  function handleBackPressIn() {
    Animated.timing(backScale, { toValue: 0.92, duration: 100, useNativeDriver: true }).start();
  }

  function handleBackPressOut() {
    Animated.timing(backScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  }

  function handleRightPressIn() {
    Animated.timing(rightOpacity, { toValue: 0.6, duration: 80, useNativeDriver: true }).start();
  }

  function handleRightPressOut() {
    Animated.timing(rightOpacity, { toValue: 1, duration: 80, useNativeDriver: true }).start();
  }

  const showRightAction = Boolean(rightLabel && onRight);

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.blurFill} />
      <View style={styles.barRow}>
        {onBack ? (
          <Animated.View style={{ transform: [{ scale: backScale }] }}>
            <Pressable
              style={styles.backButton}
              onPress={onBack}
              onPressIn={handleBackPressIn}
              onPressOut={handleBackPressOut}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Feather name="chevron-left" size={24} color={colors.brand} />
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={typography.navTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {showRightAction ? (
          <Animated.View style={{ opacity: rightOpacity }}>
            <Pressable
              onPress={onRight}
              onPressIn={handleRightPressIn}
              onPressOut={handleRightPressOut}
              accessibilityRole="button"
              accessibilityLabel={rightLabel}
            >
              <Text style={[typography.navRightAction, styles.rightAction]}>{rightLabel}</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
      </View>
    </View>
  );
}
