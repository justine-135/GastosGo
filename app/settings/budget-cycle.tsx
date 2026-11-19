import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getDb } from '../../src/db';
import { loadSettings, saveSettings } from '../../src/db/settings';
import { NavBar } from '../../src/components/NavBar';
import { colors } from '../../src/theme/colors';
import { styles } from '../../src/screens/settings/budget-cycle.styles';

const PRESET_DAYS = [1, 5, 10, 15, 20, 25];

export default function BudgetCycleScreen() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [customText, setCustomText] = useState('');

  useFocusEffect(
    useCallback(() => {
      const currentDay = loadSettings(getDb()).budgetCycleDay;
      setSelectedDay(currentDay);
      if (!PRESET_DAYS.includes(currentDay)) {
        setCustomText(String(currentDay));
      }
    }, []),
  );

  function handleSelectPreset(day: number) {
    setSelectedDay(day);
    setCustomText('');
    saveSettings(getDb(), { budgetCycleDay: day });
  }

  function handleCustomChange(text: string) {
    setCustomText(text);
    const parsed = parseInt(text, 10);
    if (parsed >= 1 && parsed <= 28) {
      setSelectedDay(parsed);
      saveSettings(getDb(), { budgetCycleDay: parsed });
    }
  }

  return (
    <View style={styles.container}>
      <NavBar title="Budget Cycle" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Cycle starts on day</Text>
        <View style={styles.card}>
          {PRESET_DAYS.map((day, index) => (
            <Pressable
              key={day}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowBorder,
                pressed && { backgroundColor: colors.grayLight },
              ]}
              onPress={() => handleSelectPreset(day)}
            >
              <Text style={styles.rowLabel}>Day {day}</Text>
              {selectedDay === day && <Feather name="check" size={18} color={colors.brand} />}
            </Pressable>
          ))}
        </View>

        <Text style={styles.customLabel}>Custom day (1–28)</Text>
        <TextInput
          style={styles.customInput}
          value={customText}
          onChangeText={handleCustomChange}
          placeholder="e.g. 3"
          placeholderTextColor={colors.gray2}
          keyboardType="number-pad"
          maxLength={2}
        />
      </ScrollView>
    </View>
  );
}
