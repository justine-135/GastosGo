// FE-11: Savings Gap Tracker Screen
// Can be rendered as a standalone screen or embedded in another tab.
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  SafeAreaView, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { styles } from './SavingsScreen.styles';
import { colors, white } from '../../theme/index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import { useSavings } from '../../hooks/useSavings';
import { MonthNavigator } from '../../components/MonthNavigator';
import { SkeletonBox } from '../../components/SkeletonBox';
import { formatPeso } from '../../utils/format';
import { getProfile, insertIncomeRecord } from '../../lib/db';
import type { IncomeMode } from '../../lib/db/types';
import { LOCAL_USER_ID } from '../../lib/constants';

const USER_ID = LOCAL_USER_ID;

export default function SavingsScreen() {
  const qc = useQueryClient();
  const { selectedMonth, selectedYear } = useUIStore();
  const { data: savings, isLoading: loadingSavings, refetch } = useSavings(selectedMonth, selectedYear);
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const addIncome = useMutation({
    mutationFn: () => insertIncomeRecord({
      amount: parseFloat(incomeAmount),
      source: incomeSource.trim() || 'Salary',
      month: selectedMonth,
      year: selectedYear,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      setShowAddIncome(false);
      setIncomeSource('');
      setIncomeAmount('');
    },
  });

  async function handleAddIncome() {
    const a = parseFloat(incomeAmount);
    if (isNaN(a) || a <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid income amount.');
      return;
    }
    addIncome.mutate();
  }

  const mode: IncomeMode = profile?.incomeMode ?? 'salary';
  const isLoading = loadingSavings;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.light.primary} />}
      >
        <Text style={styles.screenTitle}>Savings Gap</Text>
        <MonthNavigator />

        {/* Summary cards */}
        {isLoading ? (
          <View style={styles.cardsRow}>
            <SkeletonBox height={90} borderRadius={16} style={styles.card} />
            <SkeletonBox height={90} borderRadius={16} style={styles.card} />
            <SkeletonBox height={90} borderRadius={16} style={styles.card} />
          </View>
        ) : savings ? (
          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Expected</Text>
              <Text style={styles.cardAmount}>{formatPeso(savings.expectedSavings)}</Text>
              <Text style={styles.cardSub}>Savings target</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Actual</Text>
              <Text style={styles.cardAmount}>{formatPeso(savings.actualSavings)}</Text>
              <Text style={styles.cardSub}>Income − Expenses</Text>
            </View>
            <View style={[styles.card, styles.gapCard, { borderColor: savings.gap >= 0 ? colors.light.muted : colors.light.error }]}>
              <Text style={styles.cardLabel}>Gap</Text>
              <Text style={[styles.cardAmount, savings.gap >= 0 ? styles.positive : styles.negative]}>
                {savings.gap >= 0 ? '+' : ''}{formatPeso(savings.gap)}
              </Text>
              <Text style={styles.cardSub}>
                {savings.gap >= 0 ? '✅ Ahead of target' : '⚠️ Behind target'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Income input section based on mode */}
        {mode === 'salary' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Monthly Salary</Text>
            <Text style={styles.infoAmount}>{formatPeso(profile?.monthlySalary ?? 0)}</Text>
            <Text style={styles.infoSub}>To update, go to Settings → Income Mode.</Text>
          </View>
        )}

        {mode === 'mixed' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Income Sources</Text>
              <TouchableOpacity
                onPress={() => setShowAddIncome(true)}
                accessibilityRole="button"
                accessibilityLabel="Add income source"
                style={styles.addIncomeBtn}
              >
                <Text style={styles.addIncomeBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {showAddIncome && (
              <View style={styles.addIncomeForm}>
                <TextInput
                  style={styles.input}
                  value={incomeSource}
                  onChangeText={setIncomeSource}
                  placeholder="Source (e.g. Freelance)"
                  placeholderTextColor={colors.light.mutedForeground}
                  accessibilityLabel="Income source label"
                />
                <View style={styles.amountRow}>
                  <Text style={styles.pesoSign}>₱</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={incomeAmount}
                    onChangeText={(v) => setIncomeAmount(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="Amount"
                    placeholderTextColor={colors.light.mutedForeground}
                    accessibilityLabel="Income amount"
                  />
                </View>
                <View style={styles.formActions}>
                  <TouchableOpacity onPress={() => setShowAddIncome(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddIncome}
                    style={styles.saveBtn}
                    disabled={addIncome.isPending}
                    accessibilityRole="button"
                    accessibilityLabel="Save income record"
                  >
                    {addIncome.isPending
                      ? <ActivityIndicator size="small" color={white} />
                      : <Text style={styles.saveBtnText}>Add Income</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {mode === 'target' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Savings Target</Text>
            <Text style={styles.infoAmount}>{formatPeso(profile?.savingsTarget ?? 0)}</Text>
            <Text style={styles.infoSub}>Gap = Target − Actual Savings. To update, go to Settings.</Text>
          </View>
        )}

        {/* Gap explanation */}
        {savings && (
          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Income</Text>
              <Text style={styles.breakdownValue}>{formatPeso(savings.totalIncome)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Expenses</Text>
              <Text style={[styles.breakdownValue, styles.negative]}>−{formatPeso(savings.totalExpenses)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.breakdownLabelBold}>Actual Savings</Text>
              <Text style={[styles.breakdownValue, styles.breakdownValueBold]}>
                {formatPeso(savings.actualSavings)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

