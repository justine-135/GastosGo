import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getDb } from '../../src/db';
import { saveSettings, IncomeMode } from '../../src/db/settings';
import { styles } from '../../src/screens/onboarding/index.styles';
import { colors } from '../../src/theme/colors';

const MODES: { key: IncomeMode; label: string; description: string; icon: string; iconBg: string }[] = [
  { key: 'salary', label: 'Salary', description: 'Fixed monthly income', icon: 'dollar-sign', iconBg: colors.brandBg },
  { key: 'mixed', label: 'Mixed', description: 'Salary + freelance income', icon: 'shuffle', iconBg: '#FEF3C7' },
  { key: 'target', label: 'Target', description: 'Set a savings goal, no income logging', icon: 'target', iconBg: '#CCFBF1' },
];

function ModeCard({
  mode,
  selected,
  onPress,
  enterDelay,
}: {
  mode: (typeof MODES)[number];
  selected: boolean;
  onPress: () => void;
  enterDelay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: enterDelay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: enterDelay, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 400, delay: enterDelay, useNativeDriver: true }),
    ]).start();
  }, []);

  function handlePressIn() {
    Animated.timing(pressScale, { toValue: 0.98, duration: 120, useNativeDriver: true }).start();
  }
  function handlePressOut() {
    Animated.timing(pressScale, { toValue: 1, duration: 120, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }, { scale: pressScale }] }}>
      <TouchableOpacity
        style={[styles.modeCard, selected && styles.modeCardSelected]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.iconSlot, { backgroundColor: mode.iconBg }]}>
          <Feather name={mode.icon as any} size={22} color={colors.brand} />
        </View>
        <View style={styles.modeCardTextGroup}>
          <Text style={styles.modeCardTitle}>{mode.label}</Text>
          <Text style={styles.modeCardDesc}>{mode.description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OnboardingIncomeMode() {
  const [selected, setSelected] = useState<IncomeMode | null>(null);

  function handleNext() {
    if (!selected) return;
    saveSettings(getDb(), { incomeMode: selected });
    router.push({ pathname: '/onboarding/amounts', params: { mode: selected } });
  }

  return (
    <LinearGradient
      colors={['#EEF1FE', '#F7F7F9', '#EEF1FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
        <Feather name="chevron-left" size={24} color={colors.brand} />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.eyebrow}>Step 1 of 2</Text>
        <Text style={styles.title}>How do you earn?</Text>
        <Text style={styles.subtitle}>This determines how your Savings Gap is calculated.</Text>

        {MODES.map((mode, index) => (
          <ModeCard
            key={mode.key}
            mode={mode}
            selected={selected === mode.key}
            onPress={() => setSelected(mode.key)}
            enterDelay={index * 70}
          />
        ))}

        <View style={styles.dotsRow}>
          <View style={styles.dotActive} />
          <View style={styles.dotInactive} />
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={styles.continueLabel}>Continue</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
