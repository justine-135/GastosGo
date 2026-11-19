import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getDb } from '../../src/db';
import { saveSettings, markOnboardingDone, IncomeMode } from '../../src/db/settings';
import { styles } from '../../src/screens/onboarding/amounts.styles';

export default function OnboardingAmounts() {
  const { mode } = useLocalSearchParams<{ mode: IncomeMode }>();
  const [salary, setSalary] = useState('');
  const [freelance, setFreelance] = useState('');
  const [expectedSavings, setExpectedSavings] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');

  const isTarget = mode === 'target';
  const canProceed = isTarget ? Number(savingsTarget) > 0 : Number(salary) > 0;

  function handleDone() {
    const db = getDb();
    if (isTarget) {
      saveSettings(db, { savingsTarget: Number(savingsTarget) });
    } else {
      saveSettings(db, {
        monthlySalary: Number(salary),
        freelanceIncome: mode === 'mixed' ? Number(freelance) : 0,
        expectedSavings: Number(expectedSavings),
      });
    }
    markOnboardingDone(db);
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isTarget ? 'Set your savings goal' : 'Your income'}</Text>

      {!isTarget && (
        <>
          <Text style={styles.label}>Monthly salary (₱)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={salary} onChangeText={setSalary} placeholder="0" />
          {mode === 'mixed' && (
            <>
              <Text style={styles.label}>Freelance income this month (₱)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={freelance} onChangeText={setFreelance} placeholder="0" />
            </>
          )}
          <Text style={styles.label}>Expected savings (₱)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={expectedSavings} onChangeText={setExpectedSavings} placeholder="0" />
        </>
      )}

      {isTarget && (
        <>
          <Text style={styles.label}>Savings target this month (₱)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={savingsTarget} onChangeText={setSavingsTarget} placeholder="0" />
        </>
      )}

      <TouchableOpacity
        style={[styles.done, !canProceed && styles.doneDisabled]}
        onPress={handleDone}
        disabled={!canProceed}
        activeOpacity={0.8}
      >
        <Text style={styles.doneLabel}>Start tracking</Text>
      </TouchableOpacity>
    </View>
  );
}
