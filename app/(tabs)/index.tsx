// FE-04: Dashboard Screen
import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import styles from './index.styles';
import { colors } from '../../theme/index';
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
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.light.primary} />
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

