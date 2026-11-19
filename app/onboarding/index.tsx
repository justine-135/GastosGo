import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { getDb } from '../../src/db';
import { saveSettings, markOnboardingDone, IncomeMode } from '../../src/db/settings';
import { styles } from '../../src/screens/onboarding/index.styles';

const MODES: { key: IncomeMode; label: string; description: string }[] = [
  { key: 'salary', label: 'Salary', description: 'Fixed monthly income' },
  { key: 'mixed', label: 'Mixed', description: 'Salary + freelance income' },
  { key: 'target', label: 'Target', description: 'Set a savings goal, no income logging' },
];

export default function OnboardingIncomeMode() {
  const [selected, setSelected] = useState<IncomeMode | null>(null);

  function handleNext() {
    if (!selected) return;
    saveSettings(getDb(), { incomeMode: selected });
    router.push({ pathname: '/onboarding/amounts', params: { mode: selected } });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How do you earn?</Text>
      <Text style={styles.subtitle}>This determines how your Savings Gap is calculated.</Text>
      {MODES.map(({ key, label, description }) => (
        <TouchableOpacity
          key={key}
          style={[styles.option, selected === key && styles.optionSelected]}
          onPress={() => setSelected(key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionLabel, selected === key && styles.optionLabelSelected]}>{label}</Text>
          <Text style={styles.optionDesc}>{description}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.next, !selected && styles.nextDisabled]}
        onPress={handleNext}
        disabled={!selected}
        activeOpacity={0.8}
      >
        <Text style={styles.nextLabel}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
