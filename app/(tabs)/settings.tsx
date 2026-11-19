import { useCallback, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDb } from '../../src/db';
import { listDeletedExpenses, restoreExpense, ExpenseRow } from '../../src/db/expenses';
import { listCategories, CategoryRow } from '../../src/db/categories';
import { fmtPeso } from '../../src/utils/fmtPeso';
import { styles } from '../../src/screens/tabs/settings.styles';

export default function SettingsScreen() {
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

  const handleRestore = useCallback((expenseId: string) => {
    restoreExpense(getDb(), expenseId);
    reload();
  }, [reload]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionHeader}>Recently Deleted</Text>
      {deletedExpenses.length === 0 ? (
        <Text style={styles.empty}>No recently deleted expenses.</Text>
      ) : (
        <FlatList
          data={deletedExpenses}
          keyExtractor={(expense) => expense.id}
          scrollEnabled={false}
          renderItem={({ item: expense }) => {
            const category = expense.category_id ? categoriesById[expense.category_id] : undefined;
            return (
              <View style={styles.row}>
                <Text style={styles.icon}>{category?.icon ?? '📦'}</Text>
                <View style={styles.rowMain}>
                  <Text style={styles.category}>{category?.name ?? 'Uncategorized'}</Text>
                  <Text style={styles.meta}>{expense.date} · {expense.payment_method}</Text>
                </View>
                <Text style={styles.amount}>{fmtPeso(expense.amount)}</Text>
                <TouchableOpacity style={styles.restoreButton} onPress={() => handleRestore(expense.id)}>
                  <Text style={styles.restoreLabel}>Restore</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </ScrollView>
  );
}
