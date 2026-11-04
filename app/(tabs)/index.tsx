// FE-04: Dashboard Screen
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import { useRecentExpenses } from '../../hooks/useExpenses';
import { useBudgets } from '../../hooks/useBudgets';
import { useSavings } from '../../hooks/useSavings';
import { useRulesDueSoon } from '../../hooks/useRecurring';
import { SkeletonBox } from '../../components/SkeletonBox';
import { BudgetProgressBar } from '../../components/BudgetProgressBar';
import { formatPeso, formatDate, formatMonthYear } from '../../utils/format';

export default function DashboardScreen() {
  const qc = useQueryClient();
  const { selectedMonth, selectedYear } = useUIStore();

  const { data: recentExpenses, isLoading: loadingRecent } = useRecentExpenses(5);
  const { data: budgets, isLoading: loadingBudgets } = useBudgets(selectedMonth, selectedYear);
  const { data: savings, isLoading: loadingSavings } = useSavings(selectedMonth, selectedYear);
  const { data: upcomingBills, isLoading: loadingBills } = useRulesDueSoon(7);

  const isLoading = loadingRecent || loadingBudgets || loadingSavings || loadingBills;

  const onRefresh = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['expenses'] }),
      qc.invalidateQueries({ queryKey: ['budgets'] }),
      qc.invalidateQueries({ queryKey: ['savings'] }),
      qc.invalidateQueries({ queryKey: ['recurring'] }),
    ]);
  }, [qc]);

  const criticalBudget = budgets
    ?.filter((b) => b.monthlyBudget > 0)
    .sort((a, b) => b.percent - a.percent)[0] ?? null;

  const hasAnyExpenses = (recentExpenses?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#F4A261" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day! 👋</Text>
            <Text style={styles.monthLabel}>{formatMonthYear(selectedMonth, selectedYear)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={styles.settingsBtn}
          >
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Summary widgets */}
        <View style={styles.widgetsGrid}>
          {/* Total Spend Card */}
          <View style={[styles.card, styles.cardWide]}>
            {loadingSavings ? (
              <SkeletonLoader />
            ) : savings ? (
              <>
                <Text style={styles.cardLabel}>Total Spent</Text>
                <Text style={styles.cardAmount}>{formatPeso(savings.totalExpenses)}</Text>
                <Text style={styles.cardSub}>
                  {formatPeso(savings.totalIncome - savings.totalExpenses)} left of {formatPeso(savings.totalIncome)}
                </Text>
              </>
            ) : null}
          </View>

          {/* Budget Health Card */}
          <View style={styles.card}>
            {loadingBudgets ? (
              <SkeletonLoader />
            ) : criticalBudget ? (
              <>
                <Text style={styles.cardLabel}>Budget Alert</Text>
                <Text style={styles.cardSubtitle}>{criticalBudget.categoryName}</Text>
                <BudgetProgressBar percent={criticalBudget.percent} height={6} />
                <Text style={[styles.cardSub, criticalBudget.percent >= 100 && styles.overBudget]}>
                  {criticalBudget.percent >= 100 ? '🚨 Over budget' : `${Math.round(criticalBudget.percent)}% used`}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.cardLabel}>Budgets</Text>
                <Text style={styles.cardSub}>All clear ✅</Text>
              </>
            )}
          </View>

          {/* Savings Gap Card */}
          <View style={styles.card}>
            {loadingSavings ? (
              <SkeletonLoader />
            ) : savings ? (
              <>
                <Text style={styles.cardLabel}>Savings Gap</Text>
                <Text style={[styles.cardAmount, savings.gap >= 0 ? styles.positive : styles.negative]}>
                  {savings.gap >= 0 ? '+' : ''}{formatPeso(savings.gap)}
                </Text>
                <Text style={styles.cardSub}>
                  {savings.gap >= 0 ? 'Ahead of target' : 'Behind target'}
                </Text>
              </>
            ) : null}
          </View>

          {/* Upcoming Bills Card */}
          <View style={styles.card}>
            {loadingBills ? (
              <SkeletonLoader />
            ) : (
              <>
                <Text style={styles.cardLabel}>Bills Due (7d)</Text>
                {upcomingBills && upcomingBills.length > 0 ? (
                  upcomingBills.slice(0, 2).map((bill) => (
                    <View key={bill.id} style={styles.billRow}>
                      <Text style={styles.billName} numberOfLines={1}>{bill.name}</Text>
                      <Text style={styles.billAmount}>{formatPeso(bill.amount)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.cardSub}>No bills due soon</Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {loadingRecent ? (
            <View style={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonRow}>
                  <SkeletonBox width={40} height={40} borderRadius={20} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <SkeletonBox width="60%" height={14} />
                    <SkeletonBox width="40%" height={12} />
                  </View>
                  <SkeletonBox width={60} height={14} />
                </View>
              ))}
            </View>
          ) : !hasAnyExpenses ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💸</Text>
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptySubtitle}>Log your first expense to start tracking.</Text>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => router.push('/modals/add-expense')}
                accessibilityRole="button"
                accessibilityLabel="Log your first expense"
              >
                <Text style={styles.ctaBtnText}>Log your first expense</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentExpenses?.map((expense) => (
              <View key={expense.id} style={styles.transRow}>
                <View style={[styles.categoryDot, { backgroundColor: expense.categoryColor }]} />
                <View style={styles.transInfo}>
                  <Text style={styles.transMerchant} numberOfLines={1}>
                    {expense.merchant ?? expense.categoryName}
                  </Text>
                  <Text style={styles.transDate}>{formatDate(expense.date)}</Text>
                </View>
                <Text style={styles.transAmount}>{formatPeso(expense.amount)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/add-expense')}
        accessibilityRole="button"
        accessibilityLabel="Add new expense"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function SkeletonLoader() {
  return (
    <View style={{ gap: 8 }}>
      <SkeletonBox width="50%" height={12} />
      <SkeletonBox width="80%" height={20} />
      <SkeletonBox width="60%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  scroll: { padding: 16, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#2D3047' },
  monthLabel: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  settingsBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  widgetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    gap: 6, borderWidth: 1, borderColor: '#E5D5C0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardWide: { minWidth: '100%' },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardAmount: { fontSize: 26, fontWeight: '700', color: '#2D3047' },
  cardSubtitle: { fontSize: 14, fontWeight: '600', color: '#2D3047' },
  cardSub: { fontSize: 13, color: '#6B7280' },
  overBudget: { color: '#E76F51' },
  positive: { color: '#81B29A' },
  negative: { color: '#E76F51' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billName: { flex: 1, fontSize: 13, color: '#2D3047' },
  billAmount: { fontSize: 13, fontWeight: '600', color: '#F4A261' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3047' },
  skeletonList: { gap: 12 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#2D3047' },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  ctaBtn: { backgroundColor: '#F4A261', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, marginTop: 8 },
  ctaBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  transRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E5D5C0',
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  transInfo: { flex: 1 },
  transMerchant: { fontSize: 15, fontWeight: '500', color: '#2D3047' },
  transDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: '700', color: '#2D3047' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: '#F4A261', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#F4A261', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 30, color: '#FFFFFF', lineHeight: 34, marginTop: -2 },
});
