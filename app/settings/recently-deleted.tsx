import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getDb } from '../../src/db';
import { listDeletedExpenses, restoreExpense, softDeleteExpense, ExpenseRow } from '../../src/db/expenses';
import { listCategories, CategoryRow } from '../../src/db/categories';
import { fmtPeso } from '../../src/utils/fmtPeso';
import { styles } from '../../src/screens/settings/recently-deleted.styles';

export default function RecentlyDeletedScreen() {
  const [deletedExpenses, setDeletedExpenses] = useState<ExpenseRow[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, CategoryRow>>({});

  const reload = useCallback(() => {
    const db = getDb();
    setDeletedExpenses(listDeletedExpenses(db));
    const byId: Record<string, CategoryRow> = {};
    for (const category of listCategories(db)) byId[category.id] = category;
    setCategoriesById(byId);
  }, []);

  useFocusEffect(reload);

  function handleRestore(expenseId: string) {
    restoreExpense(getDb(), expenseId);
    reload();
  }

  function handleDelete(expenseId: string) {
    softDeleteExpense(getDb(), expenseId);
    reload();
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.infoText}>Items are kept for 30 days.</Text>
        {deletedExpenses.length === 0 ? (
          <Text style={styles.emptyText}>No recently deleted items.</Text>
        ) : (
          <View style={styles.card}>
            {deletedExpenses.map((expense, index) => {
              const category = expense.category_id ? categoriesById[expense.category_id] : undefined;
              return (
                <View key={expense.id} style={[styles.expenseRow, index === 0 && styles.expenseRowFirst]}>
                  <View style={styles.expenseBody}>
                    <Text style={styles.expenseName}>{expense.merchant ?? category?.name ?? 'Expense'}</Text>
                    <Text style={styles.expenseMeta}>{expense.date} · {expense.payment_method}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>{fmtPeso(expense.amount)}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.restoreButton} onPress={() => handleRestore(expense.id)}>
                      <Text style={styles.restoreLabel}>Restore</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(expense.id)}>
                      <Text style={styles.deleteLabel}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
