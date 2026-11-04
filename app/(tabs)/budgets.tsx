// FE-07: Category Budgets Screen
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  RefreshControl, TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '../../stores/uiStore';
import { useBudgets, useUpdateBudget } from '../../hooks/useBudgets';
import { MonthNavigator } from '../../components/MonthNavigator';
import { BudgetProgressBar } from '../../components/BudgetProgressBar';
import { SkeletonBox } from '../../components/SkeletonBox';
import { formatPeso } from '../../utils/format';
import type { BudgetProgress } from '../../lib/db/types';

export default function BudgetsScreen() {
  const { selectedMonth, selectedYear, setActiveCategoryFilter } = useUIStore();
  const { data: budgets = [], isLoading, refetch } = useBudgets(selectedMonth, selectedYear);
  const updateBudget = useUpdateBudget();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  function startEdit(item: BudgetProgress) {
    setEditingId(item.categoryId);
    setEditValue(item.monthlyBudget > 0 ? String(item.monthlyBudget) : '');
  }

  async function commitEdit(item: BudgetProgress) {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid amount', 'Please enter a valid budget amount.');
      return;
    }
    setEditingId(null);
    // Optimistic update: mutate immediately
    updateBudget.mutate({ categoryId: item.categoryId, monthlyBudget: val });
  }

  function handleCategoryPress(item: BudgetProgress) {
    setActiveCategoryFilter(item.categoryId);
    router.push('/(tabs)/expenses');
  }

  function renderItem({ item }: { item: BudgetProgress }) {
    const isOver = item.monthlyBudget > 0 && item.percent >= 100;
    const isNear = item.monthlyBudget > 0 && item.percent >= 80 && item.percent < 100;
    const hasLimit = item.monthlyBudget > 0;

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleCategoryPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.categoryName} budget. ${hasLimit ? `${formatPeso(item.spent)} of ${formatPeso(item.monthlyBudget)} used.` : 'No limit set.'} ${isOver ? 'Over budget.' : isNear ? 'Near limit.' : ''}`}
      >
        <View style={styles.rowHeader}>
          <Text style={styles.catIcon}>{item.categoryIcon}</Text>
          <View style={styles.catInfo}>
            <Text style={styles.catName}>{item.categoryName}</Text>
            <Text style={styles.catAmount}>
              {formatPeso(item.spent)}
              {hasLimit ? ` / ${formatPeso(item.monthlyBudget)}` : ' spent'}
            </Text>
          </View>
          <View style={styles.rowActions}>
            {(isOver || isNear) && (
              <Text style={styles.warningIcon} accessibilityLabel={isOver ? 'Over budget' : 'Near limit'}>
                {isOver ? '🚨' : '⚠️'}
              </Text>
            )}
            {editingId === item.categoryId ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.editInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType="numeric"
                  autoFocus
                  onSubmitEditing={() => commitEdit(item)}
                  onBlur={() => commitEdit(item)}
                  accessibilityLabel={`Edit budget for ${item.categoryName}`}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => startEdit(item)}
                style={styles.editBtn}
                accessibilityRole="button"
                accessibilityLabel={`Edit budget for ${item.categoryName}`}
              >
                <Text style={styles.editBtnText}>Edit ✏️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {hasLimit ? (
          <BudgetProgressBar percent={item.percent} height={10} />
        ) : (
          <Text style={styles.noLimit}>No limit set</Text>
        )}

        {isOver && <Text style={styles.warningText}>Over budget</Text>}
        {isNear && !isOver && <Text style={styles.nearText}>Near limit</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Budgets</Text>
      </View>

      <MonthNavigator />

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} height={80} borderRadius={16} style={{ marginHorizontal: 16 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.categoryId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#F4A261" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>No budget data yet</Text>
              <Text style={styles.emptySub}>Add expenses and set category budgets to see your progress.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  headerBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  screenTitle: { fontSize: 28, fontWeight: '700', color: '#2D3047' },
  skeletonContainer: { gap: 10, paddingTop: 10 },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  row: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#E5D5C0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon: { fontSize: 24 },
  catInfo: { flex: 1 },
  catName: { fontSize: 16, fontWeight: '600', color: '#2D3047' },
  catAmount: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warningIcon: { fontSize: 18 },
  editRow: { flexDirection: 'row', alignItems: 'center' },
  editInput: {
    borderWidth: 1.5, borderColor: '#F4A261', borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 6, fontSize: 15, color: '#2D3047', width: 80, textAlign: 'right', minHeight: 36,
  },
  editBtn: { backgroundColor: '#FFF3E8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minHeight: 36, justifyContent: 'center' },
  editBtnText: { fontSize: 13, color: '#F4A261', fontWeight: '500' },
  noLimit: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  warningText: { fontSize: 13, color: '#E76F51', fontWeight: '600' },
  nearText: { fontSize: 13, color: '#E9C46A', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#2D3047' },
  emptySub: { fontSize: 15, color: '#6B7280', textAlign: 'center', paddingHorizontal: 24 },
});
