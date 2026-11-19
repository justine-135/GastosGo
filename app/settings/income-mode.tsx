import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getDb } from '../../src/db';
import { loadSettings, saveSettings, IncomeMode } from '../../src/db/settings';
import { NavBar } from '../../src/components/NavBar';
import { colors } from '../../src/theme/colors';
import { styles } from '../../src/screens/settings/income-mode.styles';

const MODES: { key: IncomeMode; label: string; description: string; icon: string; iconBg: string }[] = [
  { key: 'salary', label: 'Salary', description: 'Fixed monthly income', icon: 'dollar-sign', iconBg: colors.brandBg },
  { key: 'mixed', label: 'Mixed', description: 'Salary + freelance income', icon: 'shuffle', iconBg: colors.amberBg },
  { key: 'target', label: 'Target', description: 'Set a savings goal, no income logging', icon: 'target', iconBg: colors.greenBg },
];

export default function IncomeModeScreen() {
  const [selectedMode, setSelectedMode] = useState<IncomeMode>('salary');

  useFocusEffect(
    useCallback(() => {
      setSelectedMode(loadSettings(getDb()).incomeMode);
    }, []),
  );

  function handleSelect(mode: IncomeMode) {
    setSelectedMode(mode);
    saveSettings(getDb(), { incomeMode: mode });
  }

  return (
    <View style={styles.container}>
      <NavBar title="Income Mode" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>How do you earn?</Text>
        <Text style={styles.subheading}>This determines how your Savings Gap is calculated.</Text>
        {MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[styles.modeCard, selectedMode === mode.key && styles.modeCardSelected]}
            onPress={() => handleSelect(mode.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconSlot, { backgroundColor: mode.iconBg }]}>
              <Feather name={mode.icon as any} size={22} color={colors.brand} />
            </View>
            <View style={styles.modeCardTextGroup}>
              <Text style={styles.modeCardTitle}>{mode.label}</Text>
              <Text style={styles.modeCardDesc}>{mode.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
