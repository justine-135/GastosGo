import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDb } from '../../src/db';
import { listExpenses, softDeleteExpense, ExpenseRow } from '../../src/db/expenses';
import { listCategories, CategoryRow } from '../../src/db/categories';
import { fmtPeso, todayStr } from '../../src/utils/fmtPeso';
import { fmtDate } from '../../src/utils/fmtDate';
import { styles } from './index.styles';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, CategoryRow>>({});

  const reload = useCallback(() => {
    const db = getDb();
    setExpenses(listExpenses(db));
    const byId: Record<string, CategoryRow> = {};
    for (const category of listCategories(db)) byId[category.id] = category;
    setCategoriesById(byId);
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
