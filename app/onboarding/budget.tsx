// Onboarding Screen 3 — First Budget Setup
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, SafeAreaView,
  FlatList, ActivityIndicator,
} from 'react-native';
import styles from './budget.styles';
import { colors, white } from '../../theme/index';
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
      // shortcut: not transactional — partial budget saves possible on network error,
      //           upgrade to a DB transaction when the data layer supports it
      const parseMaybe = (s: string | undefined) => {
        if (!s?.trim()) return undefined;
        const n = parseFloat(s);
        return Number.isNaN(n) ? undefined : n;
      };
      await insertProfile({
        incomeMode: incomeMode ?? 'salary',
        monthlySalary: parseMaybe(salary),
        savingsTarget: parseMaybe(savingsTarget),
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
          placeholderTextColor={colors.light.mutedForeground}
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
          <ActivityIndicator color={colors.light.primary} style={{ marginTop: 32 }} />
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
            ? <ActivityIndicator color={white} />
            : <Text style={styles.doneBtnText}>Done — Let's Go! 🚀</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

