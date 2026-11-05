// Onboarding Screen 2 — Income Setup
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
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
                style={styles.input}
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
                placeholder="e.g. 25000"
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  scroll: { padding: 24, paddingBottom: 48, gap: 20 },
  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5D5C0' },
  dotActive: { backgroundColor: '#F4A261', width: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D3047' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: -8 },
  radioGroup: { gap: 12 },
  radioCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#E5D5C0', minHeight: 72,
  },
  radioCardSelected: { borderColor: '#F4A261', backgroundColor: '#FFF3E8' },
  radioCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: '#E5D5C0', alignItems: 'center', justifyContent: 'center',
  },
  radioCircleSelected: { borderColor: '#F4A261' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#F4A261' },
  radioText: { flex: 1 },
  radioLabel: { fontSize: 16, fontWeight: '600', color: '#2D3047' },
  radioDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 15, fontWeight: '500', color: '#2D3047' },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5D5C0', paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 17, color: '#2D3047', minHeight: 52,
  },
  nextBtn: {
    backgroundColor: '#F4A261', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 8, minHeight: 56,
  },
  nextBtnDisabled: { backgroundColor: '#E5D5C0' },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
