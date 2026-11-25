import { useCallback, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { getDb } from '../../src/db';
import { listExpenses, softDeleteExpense, ExpenseRow } from '../../src/db/expenses';
import { listCategories, CategoryRow } from '../../src/db/categories';
import { fmtPeso, todayStr } from '../../src/utils/fmtPeso';
import { fmtDate } from '../../src/utils/fmtDate';
import { groupByDate } from '../../src/utils/groupByDate';
import { styles } from '../../src/screens/tabs/history.styles';

type SectionData = { title: string; data: ExpenseRow[] };

export default function HistoryScreen() {
  const { showActionSheetWithOptions } = useActionSheet();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, CategoryRow>>({});

  const today = todayStr();
  const currentMonthLabel = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  useFocusEffect(
    useCallback(() => {
      const db = getDb();
      const rawSections = groupByDate(listExpenses(db));
      setSections(rawSections.map((section) => ({ title: section.date, data: section.expenses })));
      const categoryList = listCategories(db);
      const byId: Record<string, CategoryRow> = {};
      for (const category of categoryList) {
        byId[category.id] = category;
      }
      setCategoriesById(byId);
    }, []),
  );

  function handleExpensePress(expense: ExpenseRow) {
    const options = ['Edit', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;
    const title = `${expense.merchant ?? expense.payment_method} — ${fmtPeso(expense.amount)}`;

    showActionSheetWithOptions(
      { options, cancelButtonIndex, destructiveButtonIndex, title },
      (selectedIndex?: number) => {
        if (selectedIndex === 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const db = getDb();
          softDeleteExpense(db, expense.id);
          const rawSections = groupByDate(listExpenses(db));
          setSections(rawSections.map((s) => ({ title: s.date, data: s.expenses })));
        }
      },
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(expense) => expense.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.largeHeader}>
            <Text style={styles.largeTitle}>History</Text>
            <Text style={styles.monthLabel}>{currentMonthLabel}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySub}>Tap + to log one.</Text>
          </View>
        }
        renderSectionHeader={({ section }) => {
          const dayTotal = section.data.reduce((sum, expense) => sum + expense.amount, 0);
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {fmtDate(section.title, today).toUpperCase()}
              </Text>
              <View style={styles.dayTotalPill}>
                <Text style={styles.dayTotalText}>{fmtPeso(dayTotal)}</Text>
              </View>
            </View>
          );
        }}
        renderItem={({ item: expense, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          const category = expense.category_id ? categoriesById[expense.category_id] : null;

          return (
            <View style={[styles.cardWrapper, isFirst && styles.cardWrapperFirst]}>
              <Pressable
                style={({ pressed }) => [
                  styles.row,
                  isFirst && styles.rowFirst,
                  isLast && styles.rowLast,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => handleExpensePress(expense)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category ? `${category.color}22` : '#6B728022' },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{category?.icon ?? '📦'}</Text>
                </View>
                <View style={styles.rowMain}>
                  <Text style={styles.merchant} numberOfLines={1}>
                    {expense.merchant ?? expense.payment_method}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {expense.payment_method} · {fmtDate(expense.date, today)}
                  </Text>
                </View>
                <Text style={styles.amount}>−{fmtPeso(expense.amount)}</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}
