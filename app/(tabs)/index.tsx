import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDb } from '../../src/db';
import { listExpenses, softDeleteExpense, ExpenseRow } from '../../src/db/expenses';
import { listCategories, CategoryRow } from '../../src/db/categories';
import { loadSettings } from '../../src/db/settings';
import { computeGap, GapResult } from '../../src/utils/computeGap';
import { remainingSpendable } from '../../src/utils/computeSpendingCap';
import { fmtPeso, todayStr } from '../../src/utils/fmtPeso';
import { fmtDate } from '../../src/utils/fmtDate';
import { styles } from '../../src/screens/tabs/index.styles';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, CategoryRow>>({});
  const [gap, setGap] = useState<GapResult | null>(null);
  const [spendable, setSpendable] = useState<number | null>(null);

  const reload = useCallback(() => {
    const db = getDb();
    const loaded = listExpenses(db);
    setExpenses(loaded);
    const allCategories = listCategories(db);
    const byId: Record<string, CategoryRow> = {};
    for (const category of allCategories) byId[category.id] = category;
    setCategoriesById(byId);
    const settings = loadSettings(db);
    const totalExpenses = loaded.reduce((sum, e) => sum + e.amount, 0);
    setGap(computeGap({ ...settings, totalExpenses }));
    const hasBudgetedCategories = allCategories.some(c => c.monthly_budget > 0);
    setSpendable(hasBudgetedCategories ? remainingSpendable(allCategories, loaded, settings.budgetCycleDay) : null);
  }, []);

  useFocusEffect(reload);

  const handleDelete = useCallback((expense: ExpenseRow) => {
    Alert.alert('Delete Expense', 'Move this expense to Recently Deleted?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          softDeleteExpense(getDb(), expense.id);
          reload();
        },
      },
    ]);
  }, [reload]);

  const today = todayStr();

  return (
    <View style={styles.container}>
      {gap && (
        <View style={[styles.gapCard, gap.onTrack ? styles.gapOnTrack : styles.gapAtRisk]}>
          <Text style={styles.gapLabel}>Savings Gap</Text>
          <Text style={styles.gapAmount}>{fmtPeso(gap.gap)}</Text>
          <Text style={styles.gapStatus}>{gap.onTrack ? 'On track ✓' : 'At risk ✗'}</Text>
        </View>
      )}
      {spendable !== null && (
        <View style={styles.spendableCard}>
          <Text style={styles.spendableLabel}>Remaining Spendable</Text>
          <Text style={styles.spendableAmount}>{fmtPeso(spendable)}</Text>
        </View>
      )}
      <FlatList
        data={expenses}
        keyExtractor={(expense) => expense.id}
        ListEmptyComponent={<Text style={styles.empty}>No expenses yet. Tap + to log one.</Text>}
        renderItem={({ item: expense }) => {
          const category = expense.category_id ? categoriesById[expense.category_id] : undefined;
          return (
            <TouchableOpacity onLongPress={() => handleDelete(expense)} activeOpacity={0.7}>
              <View style={styles.row}>
                <Text style={styles.icon}>{category?.icon ?? '📦'}</Text>
                <View style={styles.rowMain}>
                  <Text style={styles.category}>{category?.name ?? 'Uncategorized'}</Text>
                  <Text style={styles.meta}>
                    {fmtDate(expense.date, today)} · {expense.payment_method}
                  </Text>
                </View>
                <Text style={styles.amount}>{fmtPeso(expense.amount)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
