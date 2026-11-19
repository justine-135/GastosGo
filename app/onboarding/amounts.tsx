import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getDb } from '../../src/db';
import { saveSettings, markOnboardingDone, IncomeMode } from '../../src/db/settings';
import { styles } from '../../src/screens/onboarding/amounts.styles';
import { colors } from '../../src/theme/colors';

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

  const screenTitle = isTarget ? 'Your savings goal' : 'Your income';

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
        <Text style={styles.eyebrow}>Step 2 of 2</Text>
        <Text style={styles.title}>{screenTitle}</Text>

        {!isTarget && (
          <>
            <Text style={styles.fieldLabel}>Monthly Salary</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>₱</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                placeholder="0"
                placeholderTextColor={colors.gray2}
              />
            </View>

            {mode === 'mixed' && (
              <>
                <Text style={styles.fieldLabel}>Freelance / Other</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={freelance}
                    onChangeText={setFreelance}
                    placeholder="0"
                    placeholderTextColor={colors.gray2}
                  />
                </View>
              </>
            )}

            <Text style={styles.fieldLabel}>Expected Savings</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>₱</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={expectedSavings}
                onChangeText={setExpectedSavings}
                placeholder="0"
                placeholderTextColor={colors.gray2}
              />
            </View>
          </>
        )}

        {isTarget && (
          <>
            <Text style={styles.fieldLabel}>Savings Target</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>₱</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={savingsTarget}
                onChangeText={setSavingsTarget}
                placeholder="0"
                placeholderTextColor={colors.gray2}
              />
            </View>
          </>
        )}

        <View style={styles.dotsRow}>
          <View style={styles.dotInactive} />
          <View style={styles.dotActive} />
        </View>

        <TouchableOpacity
          style={[styles.doneButton, !canProceed && styles.doneButtonDisabled]}
          onPress={handleDone}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.doneLabel}>Start Tracking 🎉</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
