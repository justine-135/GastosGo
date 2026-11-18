import { useCallback, useState } from 'react';
import { SectionList, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDb } from '../../src/db';
import { listExpenses, ExpenseRow } from '../../src/db/expenses';
import { fmtPeso, todayStr } from '../../src/utils/fmtPeso';
import { fmtDate } from '../../src/utils/fmtDate';
import { groupByDate } from '../../src/utils/groupByDate';
import { styles } from './history.styles';

export default function HistoryScreen() {
  const [sections, setSections] = useState<Array<{ date: string; expenses: ExpenseRow[] }>>([]);

  useFocusEffect(
    useCallback(() => {
      const db = getDb();
      setSections(groupByDate(listExpenses(db)));
    }, []),
  );

  const today = todayStr();

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections.map((section) => ({ title: section.date, data: section.expenses }))}
        keyExtractor={(expense) => expense.id}
        ListEmptyComponent={<Text style={styles.empty}>No expenses yet. Tap + to log one.</Text>}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{fmtDate(section.title, today)}</Text>
          </View>
        )}
        renderItem={({ item: expense }) => (
          <View style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.merchant}>{expense.merchant ?? expense.payment_method}</Text>
              <Text style={styles.meta}>{expense.payment_method}</Text>
            </View>
            <Text style={styles.amount}>{fmtPeso(expense.amount)}</Text>
          </View>
        )}
      />
    </View>
  );
}
