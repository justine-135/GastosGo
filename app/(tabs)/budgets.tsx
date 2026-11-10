// FE-07: Category Budgets Screen
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView,
  RefreshControl, TextInput, Alert,
} from 'react-native';
import { styles } from './budgets.styles';
import { colors } from '../../theme/index';
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
  const [refreshing, setRefreshing] = useState(false);

  function startEdit(item: BudgetProgress) {
    setEditingId(item.categoryId);
    setEditValue(item.monthlyBudget > 0 ? String(item.monthlyBudget) : '');
  }

  function handleRefresh() {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }

  async function commitEdit(item: BudgetProgress) {
    if (editingId !== item.categoryId) return; // guard: second call after state already cleared
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid amount', 'Please enter a valid budget amount.');
      return;
    }
    setEditingId(null);
    // Sends mutation and waits for server + cache refresh
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
                  placeholderTextColor={colors.light.mutedForeground}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.light.primary} />}
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

