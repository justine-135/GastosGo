import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as Haptics from 'expo-haptics';
import { getDb } from '../../src/db';
import { loadSettings, saveSettings, IncomeMode } from '../../src/db/settings';
import { colors } from '../../src/theme/colors';
import { styles } from '../../src/screens/settings/income-mode.styles';

const MODES: { key: IncomeMode; label: string; description: string }[] = [
  { key: 'salary', label: 'Salary', description: 'Fixed monthly income' },
  { key: 'mixed', label: 'Mixed', description: 'Salary + freelance income' },
  { key: 'target', label: 'Target', description: 'Set a savings goal, no income logging' },
];

export default function IncomeModeScreen() {
  const [selectedMode, setSelectedMode] = useState<IncomeMode>('salary');

  useFocusEffect(
    useCallback(() => {
      setSelectedMode(loadSettings(getDb()).incomeMode);
    }, []),
  );

  function handleSelect(index: number) {
    const mode = MODES[index].key;
    setSelectedMode(mode);
    saveSettings(getDb(), { incomeMode: mode });
  }

  const selectedIndex = MODES.findIndex((m) => m.key === selectedMode);
  const selectedDescription = MODES[selectedIndex]?.description ?? '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>How do you earn?</Text>
        <Text style={styles.subheading}>This determines how your Savings Gap is calculated.</Text>
        <SegmentedControl
          values={MODES.map((m) => m.label)}
          selectedIndex={selectedIndex}
          onChange={(event) => { Haptics.selectionAsync(); handleSelect(event.nativeEvent.selectedSegmentIndex); }}
          tintColor={colors.brand}
        />
        <Text style={styles.modeDescription}>{selectedDescription}</Text>
      </ScrollView>
    </View>
  );
}
