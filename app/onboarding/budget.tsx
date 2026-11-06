// Onboarding Screen 3 — First Budget Setup
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView,
  FlatList, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getCategories, insertProfile, updateCategory } from '../../lib/db';
import { useQuery } from '@tanstack/react-query';
import type { Category, IncomeMode } from '../../lib/db/types';

export default function OnboardingBudget() {
  const { incomeMode, salary, savingsTarget } = useLocalSearchParams<{
    incomeMode: IncomeMode; salary: string; savingsTarget: string;
  }>();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const [budgets, setBudgets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleDone() {
    setSaving(true);
    try {
      setError('');
      // ⚠️ DB-02: insertProfile stub — replace with real drizzle insert
      await insertProfile({
        incomeMode: incomeMode ?? 'salary',
        monthlySalary: parseFloat(salary ?? '0') || undefined,
        savingsTarget: parseFloat(savingsTarget ?? '0') || undefined,
      });

      // Save per-category budgets
      await Promise.all(
        Object.entries(budgets).map(([id, val]) => {
          const amount = parseFloat(val);
          if (isNaN(amount) || amount <= 0) return Promise.resolve();
          return updateCategory(id, { monthlyBudget: amount });
        })
      );

      router.push('/onboarding/pin-setup');
    } catch (e) {
      console.error(e);
      setError('Could not save your budget. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function renderCategory({ item }: { item: Category }) {
    return (
      <View style={styles.catRow}>
        <Text style={styles.catIcon}>{item.icon}</Text>
        <View style={[styles.catDot, { backgroundColor: item.color }]} />
        <Text style={styles.catName}>{item.name}</Text>
        <TextInput
          style={styles.budgetInput}
          value={budgets[item.id] ?? ''}
          onChangeText={(v) => setBudgets((prev) => ({ ...prev, [item.id]: v }))}
          keyboardType="numeric"
          placeholder="₱ limit"
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={`Monthly budget for ${item.name}`}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepRow} accessibilityLabel="Step 3 of 6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.title}>Set Your Budgets</Text>
        <Text style={styles.subtitle}>Tap a category to set a monthly limit. You can skip and edit later.</Text>

        {isLoading ? (
          <ActivityIndicator color="#F4A261" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            contentContainerStyle={styles.list}
          />
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          testID="budget-done-btn"
          style={[styles.doneBtn, saving && styles.doneBtnDisabled]}
          onPress={handleDone}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Finish onboarding and go to dashboard"
        >
          {saving
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.doneBtnText}>Done — Let's Go! 🚀</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },
  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5D5C0' },
  dotActive: { backgroundColor: '#F4A261', width: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D3047', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 16 },
  list: { gap: 12, paddingBottom: 24 },
  catRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#E5D5C0',
  },
  catIcon: { fontSize: 22 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: 15, fontWeight: '500', color: '#2D3047' },
  budgetInput: {
    width: 90, borderWidth: 1.5, borderColor: '#E5D5C0', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, color: '#2D3047',
    textAlign: 'right', minHeight: 44,
  },
  doneBtn: {
    backgroundColor: '#F4A261', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginVertical: 16, minHeight: 56,
  },
  doneBtnDisabled: { backgroundColor: '#E5D5C0' },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  errorText: { fontSize: 14, color: '#E76F51', fontWeight: '500', textAlign: 'center', marginBottom: 8 },
});
