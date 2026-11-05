// FE-06 + FE-10: Expenses List + Recurring Rules
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, ScrollView, TouchableOpacity, SafeAreaView,
  RefreshControl, Alert, type SectionListData,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import { useExpenses, useDeleteExpense } from '../../hooks/useExpenses';
import { useRecurringRules, useMarkRuleAsPaid, useDeactivateRule } from '../../hooks/useRecurring';
import { MonthNavigator } from '../../components/MonthNavigator';
import { SkeletonBox } from '../../components/SkeletonBox';
import { formatPeso, formatDate } from '../../utils/format';
import type { Expense, RecurringRule } from '../../lib/db/types';

type Tab = 'expenses' | 'recurring';

export default function ExpensesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const { selectedMonth, selectedYear, activeCategoryFilter, setActiveCategoryFilter } = useUIStore();
  const qc = useQueryClient();

  const { data: expenses = [], isLoading: loadingExpenses, refetch: refetchExpenses } = useExpenses(selectedMonth, selectedYear);
  const { data: recurringRules = [], isLoading: loadingRecurring, refetch: refetchRecurring } = useRecurringRules();
  const deleteExpense = useDeleteExpense();
  const markPaid = useMarkRuleAsPaid();
  const deactivate = useDeactivateRule();

  const isLoading = activeTab === 'expenses' ? loadingExpenses : loadingRecurring;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'expenses') {
        await refetchExpenses();
        await qc.invalidateQueries({ queryKey: ['budgets'] });
      } else {
        await refetchRecurring();
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, refetchExpenses, refetchRecurring, qc]);

  // --- Expenses tab ---

  const categories = useMemo(() => {
    const seen = new Set<string>();
    return expenses.filter((e) => {
      if (seen.has(e.categoryId)) return false;
      seen.add(e.categoryId);
      return true;
    });
  }, [expenses]);

  const filtered = useMemo(() => {
    if (!activeCategoryFilter) return expenses;
    return expenses.filter((e) => e.categoryId === activeCategoryFilter);
  }, [expenses, activeCategoryFilter]);

  const sections = useMemo((): SectionListData<Expense>[] => {
    const grouped: Record<string, Expense[]> = {};
    for (const e of filtered) {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => ({ title: formatDate(date), data }));
  }, [filtered]);

  function handleDeleteExpense(expense: Expense) {
    Alert.alert('Delete Expense', `Delete ${expense.merchant ?? expense.categoryName} (${formatPeso(expense.amount)})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => deleteExpense.mutate({ id: expense.id, date: expense.date }),
      },
    ]);
  }

  function handleEditExpense(expense: Expense) {
    router.push({
      pathname: '/modals/add-expense',
      params: {
        expenseId: expense.id,
        initialAmount: String(expense.amount),
        initialCategoryId: expense.categoryId,
        initialMerchant: expense.merchant ?? '',
        initialNotes: expense.notes ?? '',
        initialPaymentMethod: expense.paymentMethod,
        initialDate: expense.date,
      },
    });
  }

  function handleMarkPaid(rule: RecurringRule) {
    Alert.alert('Mark as Paid', `Log ${formatPeso(rule.amount)} for ${rule.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Paid',
        onPress: () => markPaid.mutate({
          ruleId: rule.id,
          categoryId: rule.categoryId,
          amount: rule.amount,
          paymentMethod: rule.paymentMethod,
        }),
      },
    ]);
  }

  function handleDeactivate(rule: RecurringRule) {
    Alert.alert('Deactivate Rule', `Deactivate ${rule.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: () => deactivate.mutate(rule.id) },
    ]);
  }

  const activeRules = recurringRules.filter((r) => r.isActive);
  const inactiveRules = recurringRules.filter((r) => !r.isActive);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(['expenses', 'recurring'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="tab"
            accessibilityLabel={tab === 'expenses' ? 'Expenses tab' : 'Recurring tab'}
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'expenses' ? '💸 Expenses' : '🔁 Recurring'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'expenses' ? (
        <>
          <MonthNavigator />

          {/* Category filter chips */}
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRowScroll}
              contentContainerStyle={styles.filterRow}
            >
              <TouchableOpacity
                style={[styles.filterChip, !activeCategoryFilter && styles.filterChipActive]}
                onPress={() => setActiveCategoryFilter(null)}
                accessibilityRole="button"
                accessibilityLabel="Show all categories"
                accessibilityState={{ selected: !activeCategoryFilter }}
              >
                <Text style={[styles.filterChipText, !activeCategoryFilter && styles.filterChipTextActive]}>All</Text>
              </TouchableOpacity>
              {categories.map((e) => (
                <TouchableOpacity
                  key={e.categoryId}
                  style={[
                    styles.filterChip,
                    { borderColor: e.categoryColor },
                    activeCategoryFilter === e.categoryId && { backgroundColor: e.categoryColor },
                  ]}
                  onPress={() => setActiveCategoryFilter(
                    activeCategoryFilter === e.categoryId ? null : e.categoryId
                  )}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${e.categoryName}`}
                  accessibilityState={{ selected: activeCategoryFilter === e.categoryId }}
                >
                  <Text style={[styles.filterChipText, activeCategoryFilter === e.categoryId && styles.filterChipTextActive]}>
                    {e.categoryName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {isLoading ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} height={56} borderRadius={12} style={{ marginHorizontal: 16 }} />
              ))}
            </View>
          ) : sections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No expenses in this month</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push('/modals/add-expense')}
                accessibilityRole="button"
                accessibilityLabel="Add an expense"
              >
                <Text style={styles.addBtnText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F4A261" />}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <ExpenseRow
                  expense={item}
                  onEdit={() => handleEditExpense(item)}
                  onDelete={() => handleDeleteExpense(item)}
                />
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      ) : (
        /* Recurring tab */
        <SectionList
          sections={[
            { title: 'Active', data: activeRules },
            ...(inactiveRules.length > 0 ? [{ title: 'Inactive', data: inactiveRules }] : []),
          ]}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          refreshControl={<RefreshControl refreshing={loadingRecurring} onRefresh={onRefresh} tintColor="#F4A261" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔁</Text>
              <Text style={styles.emptyTitle}>No recurring bills set up yet</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push('/modals/add-recurring')}
                accessibilityRole="button"
                accessibilityLabel="Add a recurring bill"
              >
                <Text style={styles.addBtnText}>Add Recurring Bill</Text>
              </TouchableOpacity>
            </View>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <RecurringRow
              rule={item}
              onMarkPaid={() => handleMarkPaid(item)}
              onEdit={() => router.push({ pathname: '/modals/add-recurring', params: { ruleId: item.id } })}
              onDeactivate={() => handleDeactivate(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.addBtn, { margin: 16 }]}
              onPress={() => router.push('/modals/add-recurring')}
              accessibilityRole="button"
              accessibilityLabel="Add recurring bill"
            >
              <Text style={styles.addBtnText}>+ Add Recurring Bill</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* FAB (expenses tab only) */}
      {activeTab === 'expenses' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/modals/add-expense')}
          accessibilityRole="button"
          accessibilityLabel="Add new expense"
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function ExpenseRow({
  expense,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.expenseRow}
      onPress={onEdit}
      onLongPress={onDelete}
      accessibilityRole="button"
      accessibilityLabel={`${expense.merchant ?? expense.categoryName}, ${formatPeso(expense.amount)}, ${expense.paymentMethod}. Long press to delete.`}
    >
      <View style={[styles.categoryDot, { backgroundColor: expense.categoryColor }]} />
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseMerchant} numberOfLines={1}>
          {expense.merchant ?? expense.categoryName}
        </Text>
        <Text style={styles.expenseSub}>{expense.categoryName} · {expense.paymentMethod}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>{formatPeso(expense.amount)}</Text>
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${expense.merchant ?? expense.categoryName}`}
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function RecurringRow({
  rule,
  onMarkPaid,
  onEdit,
  onDeactivate,
}: {
  rule: RecurringRule;
  onMarkPaid: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const badge = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[rule.frequency];
  return (
    <TouchableOpacity
      style={styles.recurringRow}
      onPress={onEdit}
      accessibilityRole="button"
      accessibilityLabel={`${rule.name}, ${formatPeso(rule.amount)}, ${badge}, due ${formatDate(rule.nextDueDate)}`}
    >
      <View style={[styles.categoryDot, { backgroundColor: rule.categoryColor }]} />
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseMerchant}>{rule.name}</Text>
        <View style={styles.recurringMeta}>
          <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
          <Text style={styles.expenseSub}>Due {formatDate(rule.nextDueDate)}</Text>
        </View>
      </View>
      <View style={styles.recurringActions}>
        <Text style={styles.expenseAmount}>{formatPeso(rule.amount)}</Text>
        {rule.isActive && (
          <TouchableOpacity
            style={styles.paidBtn}
            onPress={onMarkPaid}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${rule.name} as paid`}
          >
            <Text style={styles.paidBtnText}>Paid ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  tabRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5D5C0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#F4A261' },
  tabText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#F4A261', fontWeight: '700' },
  filterRowScroll: { borderBottomWidth: 1, borderBottomColor: '#E5D5C0' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5D5C0', minHeight: 36 },
  filterChipActive: { backgroundColor: '#F4A261', borderColor: '#F4A261' },
  filterChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF' },
  sectionHeader: { backgroundColor: '#FFF8F0', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5D5C0' },
  sectionHeaderText: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: { paddingBottom: 80 },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F5EDE0',
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  expenseInfo: { flex: 1 },
  expenseMerchant: { fontSize: 15, fontWeight: '500', color: '#2D3047' },
  expenseSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  expenseRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseAmount: { fontSize: 15, fontWeight: '700', color: '#2D3047' },
  deleteBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 16 },
  recurringRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F5EDE0',
  },
  recurringMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  badge: { backgroundColor: '#E9C46A', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#2D3047' },
  recurringActions: { alignItems: 'flex-end', gap: 4 },
  paidBtn: { backgroundColor: '#81B29A', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  paidBtnText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  skeletonContainer: { gap: 10, paddingTop: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#2D3047' },
  addBtn: { backgroundColor: '#F4A261', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, minHeight: 50, justifyContent: 'center' },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: '#F4A261', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#F4A261', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 30, color: '#FFFFFF', lineHeight: 34, marginTop: -2 },
});
