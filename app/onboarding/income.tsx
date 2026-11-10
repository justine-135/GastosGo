// Onboarding Screen 2 — Income Setup
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import styles from './income.styles';
import { colors } from '../../theme/index';
import { router } from 'expo-router';
import type { IncomeMode } from '../../lib/db/types';

type RadioOption = { value: IncomeMode; label: string; desc: string };

const OPTIONS: RadioOption[] = [
  { value: 'salary', label: 'Fixed Salary', desc: 'I receive a fixed amount each month' },
  { value: 'mixed', label: 'Salary + Freelance', desc: 'I have a salary plus variable income' },
  { value: 'target', label: 'Savings Target', desc: "I'll set a goal instead of tracking income" },
];

export default function OnboardingIncome() {
  const [mode, setMode] = useState<IncomeMode>('salary');
  const [salary, setSalary] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');

  const canContinue =
    (mode === 'salary' && salary.length > 0) ||
    (mode === 'mixed' && salary.length > 0) ||
    (mode === 'target' && savingsTarget.length > 0);

  function handleNext() {
    // Pass state via route params to budget screen
    router.push({
      pathname: '/onboarding/budget',
      params: {
        incomeMode: mode,
        salary: salary || '0',
        savingsTarget: savingsTarget || '0',
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Step indicator */}
          <View style={styles.stepRow} accessibilityLabel="Step 2 of 6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.title}>How do you earn?</Text>
          <Text style={styles.subtitle}>This helps us calculate your savings gap accurately.</Text>

          <View style={styles.radioGroup}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.radioCard, mode === opt.value && styles.radioCardSelected]}
                onPress={() => setMode(opt.value)}
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{ checked: mode === opt.value }}
              >
                <View style={[styles.radioCircle, mode === opt.value && styles.radioCircleSelected]}>
                  {mode === opt.value && <View style={styles.radioInner} />}
                </View>
                <View style={styles.radioText}>
                  <Text style={styles.radioLabel}>{opt.label}</Text>
                  <Text style={styles.radioDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {(mode === 'salary' || mode === 'mixed') && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Salary (₱)</Text>
              <TextInput
                testID="income-salary-input"
                style={styles.input}
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
                placeholder="e.g. 25000"
                placeholderTextColor={colors.light.mutedForeground}
                accessibilityLabel="Monthly salary amount"
              />
            </View>
          )}

          {(mode === 'salary' || mode === 'mixed' || mode === 'target') && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Savings Target (₱)</Text>
              <TextInput
                style={styles.input}
                value={savingsTarget}
                onChangeText={setSavingsTarget}
                keyboardType="numeric"
                placeholder="e.g. 5000"
                placeholderTextColor={colors.light.mutedForeground}
                accessibilityLabel="Monthly savings target amount"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to budget setup"
            accessibilityState={{ disabled: !canContinue }}
          >
            <Text style={styles.nextBtnText}>Continue →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

