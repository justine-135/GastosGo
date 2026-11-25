import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getDb } from '../../src/db';
import { loadSettings, IncomeMode } from '../../src/db/settings';
import { getLatestCycleSnapshot, resetCurrentCycle, softDeleteCycleExpenses } from '../../src/db/cycleSnapshots';
import { listExpenses, ExpenseRow } from '../../src/db/expenses';
import { cycleStartDate } from '../../src/utils/cycleDate';
import { todayStr, fmtPeso } from '../../src/utils/fmtPeso';
import { styles } from '../../src/screens/settings/reset-cycle.styles';

type Step = 'form' | 'expenses';

export default function ResetCycleScreen() {
  const [step, setStep] = useState<Step>('form');
  const [incomeMode, setIncomeMode] = useState<IncomeMode>('salary');
  const [cycleStart, setCycleStart] = useState('');
  const [salary, setSalary] = useState('');
  const [freelance, setFreelance] = useState('');
  const [expectedSavings, setExpectedSavings] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [currentCycleExpenses, setCurrentCycleExpenses] = useState<ExpenseRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      const db = getDb();
      const settings = loadSettings(db);
      const start = cycleStartDate(todayStr(), settings.budgetCycleDay);
      const snapshot = getLatestCycleSnapshot(db);
      setCycleStart(start);
      setIncomeMode(settings.incomeMode);
      setSalary(String(snapshot?.monthly_salary ?? settings.monthlySalary));
      setFreelance(String(snapshot?.freelance_income ?? settings.freelanceIncome));
      setExpectedSavings(String(snapshot?.expected_savings ?? settings.expectedSavings));
      setSavingsTarget(String(snapshot?.savings_target ?? settings.savingsTarget));
      setStep('form');
    }, []),
  );

  const isTarget = incomeMode === 'target';

  function loadCurrentCycleExpenses(start: string) {
    setCurrentCycleExpenses(listExpenses(getDb(), start));
  }

  function handleReviewChanges() {
    const snapshot = getLatestCycleSnapshot(getDb());
    const oldSalary = snapshot?.monthly_salary ?? 0;
    const oldFreelance = snapshot?.freelance_income ?? 0;
    const oldExpectedSavings = snapshot?.expected_savings ?? 0;
    const oldSavingsTarget = snapshot?.savings_target ?? 0;
    const oldSummary = isTarget
      ? `Savings Target: ${fmtPeso(oldSavingsTarget)}`
      : `Salary: ${fmtPeso(oldSalary)}${incomeMode === 'mixed' ? `\nFreelance: ${fmtPeso(oldFreelance)}` : ''}\nExpected Savings: ${fmtPeso(oldExpectedSavings)}`;
    const newSummary = isTarget
      ? `Savings Target: ${fmtPeso(Number(savingsTarget))}`
      : `Salary: ${fmtPeso(Number(salary))}${incomeMode === 'mixed' ? `\nFreelance: ${fmtPeso(Number(freelance))}` : ''}\nExpected Savings: ${fmtPeso(Number(expectedSavings))}`;

    Alert.alert(
      'Apply Reset?',
      `Current figures:\n${oldSummary}\n\nNew figures:\n${newSummary}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply Reset',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            resetCurrentCycle(getDb(), {
              cycleStartDate: cycleStart,
              incomeMode,
              monthlySalary: Number(salary),
              freelanceIncome: Number(freelance),
              expectedSavings: Number(expectedSavings),
              savingsTarget: Number(savingsTarget),
              wipeExpenses: false,
            });
            loadCurrentCycleExpenses(cycleStart);
            setStep('expenses');
          },
        },
      ],
    );
  }

  const expenseTotal = currentCycleExpenses.reduce((sum, e) => sum + e.amount, 0);

  function handleClearExpenses() {
    Alert.alert(
      'Clear All Expenses?',
      `This will send ${currentCycleExpenses.length} expense${currentCycleExpenses.length === 1 ? '' : 's'} (${fmtPeso(expenseTotal)}) to Recently Deleted. You can restore them within 30 days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Expenses',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            softDeleteCycleExpenses(getDb(), cycleStart);
            router.back();
          },
        },
      ],
    );
  }

  if (step === 'expenses') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionLabel}>Income figures updated</Text>
          <Text style={styles.expenseCountText}>
            {currentCycleExpenses.length === 0
              ? 'No expenses logged this cycle.'
              : `You have ${currentCycleExpenses.length} expense${currentCycleExpenses.length === 1 ? '' : 's'} (${fmtPeso(expenseTotal)}) logged this cycle. Clear them too?`}
          </Text>
          {currentCycleExpenses.length > 0 && (
            <View style={styles.card}>
              {currentCycleExpenses.map((expense, index) => (
                <View key={expense.id} style={[styles.fieldRow, index === 0 && styles.fieldRowFirst]}>
                  <Text style={styles.fieldLabel}>{expense.date}</Text>
                  <Text style={styles.currencyPrefix}>{fmtPeso(expense.amount)}</Text>
                </View>
              ))}
            </View>
          )}
          {currentCycleExpenses.length > 0 && (
            <Pressable style={styles.destructiveButton} onPress={handleClearExpenses}>
              <Text style={styles.destructiveButtonLabel}>Clear Expenses</Text>
            </Pressable>
          )}
          <Pressable style={styles.skipButton} onPress={() => router.back()}>
            <Text style={styles.skipButtonLabel}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Update figures for this cycle</Text>
        <View style={styles.card}>
          {!isTarget && (
            <>
              <View style={[styles.fieldRow, styles.fieldRowFirst]}>
                <Text style={styles.fieldLabel}>Monthly Salary</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={salary}
                    onChangeText={setSalary}
                    placeholder="0"
                  />
                </View>
              </View>
              {incomeMode === 'mixed' && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Freelance / Other</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencyPrefix}>₱</Text>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      value={freelance}
                      onChangeText={setFreelance}
                      placeholder="0"
                    />
                  </View>
                </View>
              )}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Expected Savings</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={expectedSavings}
                    onChangeText={setExpectedSavings}
                    placeholder="0"
                  />
                </View>
              </View>
            </>
          )}
          {isTarget && (
            <View style={[styles.fieldRow, styles.fieldRowFirst]}>
              <Text style={styles.fieldLabel}>Savings Target</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>₱</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={savingsTarget}
                  onChangeText={setSavingsTarget}
                  placeholder="0"
                />
              </View>
            </View>
          )}
        </View>
        <Pressable style={styles.destructiveButton} onPress={handleReviewChanges}>
          <Text style={styles.destructiveButtonLabel}>Review Changes</Text>
        </Pressable>
        <Text style={styles.warningText}>
          Changes apply to the current cycle only. Past cycles are unaffected.
        </Text>
      </ScrollView>
    </View>
  );
}
