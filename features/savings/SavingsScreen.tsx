// FE-11: Savings Gap Tracker Screen
// Can be rendered as a standalone screen or embedded in another tab.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  SafeAreaView, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import { useSavings } from '../../hooks/useSavings';
import { MonthNavigator } from '../../components/MonthNavigator';
import { SkeletonBox } from '../../components/SkeletonBox';
import { formatPeso } from '../../utils/format';
import { getProfile, insertIncomeRecord } from '../../lib/db';
import type { IncomeMode } from '../../lib/db/types';

const USER_ID = 'stub-user-001';

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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#F4A261" />}
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
            <View style={[styles.card, styles.gapCard, { borderColor: savings.gap >= 0 ? '#81B29A' : '#E76F51' }]}>
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
                  placeholderTextColor="#9CA3AF"
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
                    placeholderTextColor="#9CA3AF"
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
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  scroll: { padding: 16, gap: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 28, fontWeight: '700', color: '#2D3047' },
  cardsRow: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, gap: 4,
    borderWidth: 1, borderColor: '#E5D5C0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  gapCard: { borderWidth: 2 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardAmount: { fontSize: 18, fontWeight: '700', color: '#2D3047' },
  cardSub: { fontSize: 11, color: '#9CA3AF' },
  positive: { color: '#81B29A' },
  negative: { color: '#E76F51' },
  infoBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 6,
    borderWidth: 1, borderColor: '#E5D5C0',
  },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' },
  infoAmount: { fontSize: 28, fontWeight: '700', color: '#F4A261' },
  infoSub: { fontSize: 13, color: '#9CA3AF' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3047' },
  addIncomeBtn: { backgroundColor: '#F4A261', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, minHeight: 36 },
  addIncomeBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  addIncomeForm: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: '#E5D5C0' },
  input: {
    backgroundColor: '#F9F5F0', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5D5C0',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#2D3047', minHeight: 48,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pesoSign: { fontSize: 20, fontWeight: '700', color: '#F4A261' },
  formActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, color: '#6B7280' },
  saveBtn: { backgroundColor: '#F4A261', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  breakdown: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: '#E5D5C0' },
  breakdownTitle: { fontSize: 16, fontWeight: '700', color: '#2D3047', marginBottom: 4 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownTotal: { borderTopWidth: 1, borderTopColor: '#E5D5C0', paddingTop: 10, marginTop: 4 },
  breakdownLabel: { fontSize: 15, color: '#6B7280' },
  breakdownLabelBold: { fontSize: 15, fontWeight: '700', color: '#2D3047' },
  breakdownValue: { fontSize: 15, fontWeight: '600', color: '#2D3047' },
  breakdownValueBold: { fontSize: 17, fontWeight: '700' },
});
