import { useCallback, useRef, useEffect, useState } from 'react';
import { Alert, Animated, ScrollView, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getDb } from '../../src/db';
import { listCategories, CategoryRow } from '../../src/db/categories';
import { listExpenses } from '../../src/db/expenses';
import { loadSettings, saveSettings } from '../../src/db/settings';
import { spendingCap, budgetedSpent, CategoryBudgetStatus } from '../../src/utils/computeSpendingCap';
import { fmtPeso } from '../../src/utils/fmtPeso';
import { colors } from '../../src/theme';
import { styles } from '../../src/screens/tabs/budgets.styles';

function ProgressBar({ pct, color, trackStyle, fillStyle }: { pct: number; color: string; trackStyle: ViewStyle; fillStyle: ViewStyle }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct * 100, duration: 500, useNativeDriver: false }).start();
  }, [pct, widthAnim]);

  return (
    <View style={trackStyle}>
      <Animated.View
        style={[fillStyle, { width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: color }]}
      />
    </View>
  );
}

function progressColor(ratio: number): string {
  if (ratio > 0.85) return colors.red;
  if (ratio > 0.6) return colors.amber;
  return colors.green;
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}

export default function BudgetsScreen() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [statusById, setStatusById] = useState<Record<string, CategoryBudgetStatus>>({});
  const [cap, setCap] = useState(0);
  const [cycleStartDay, setCycleStartDay] = useState(1);

  const reload = useCallback(() => {
    const db = getDb();
    const loadedCategories = listCategories(db);
    const expenses = listExpenses(db);
    const settings = loadSettings(db);
    const day = settings.budgetCycleDay;

    setCategories(loadedCategories);
    setCycleStartDay(day);
    setCap(spendingCap(loadedCategories));

    const statuses = budgetedSpent(expenses, loadedCategories, day);
    const byId: Record<string, CategoryBudgetStatus> = {};
    for (const status of statuses) byId[status.categoryId] = status;
    setStatusById(byId);
  }, []);

  useFocusEffect(reload);

  const handleCycleDayPress = useCallback(() => {
    Alert.prompt(
      'Budget Cycle Start Day',
      'Enter the day of month (1–28) when your budget cycle resets.',
      (inputText) => {
        const parsed = parseInt(inputText ?? '', 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 28) {
          Alert.alert('Invalid day', 'Please enter a number between 1 and 28.');
          return;
        }
        saveSettings(getDb(), { budgetCycleDay: parsed });
        reload();
      },
      'plain-text',
      String(cycleStartDay),
      'number-pad',
    );
  }, [cycleStartDay, reload]);

  const totalSpent = Object.values(statusById).reduce((sum, status) => sum + status.spent, 0);
  const summaryRatio = cap > 0 ? Math.min(totalSpent / cap, 1) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 104, paddingBottom: 32 }}>
      <Text style={styles.largeTitle}>Budgets</Text>
      <Text style={styles.monthLabel}>{currentMonthLabel()}</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRing} />
        <View style={styles.summaryColumns}>
          <View>
            <Text style={styles.summaryColLabel}>Total Cap</Text>
            <Text style={styles.summaryAmount}>{fmtPeso(cap)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryColLabel}>Spent</Text>
            <Text style={[styles.summaryAmount, totalSpent > cap && cap > 0 ? styles.summaryAmountOver : undefined]}>
              {fmtPeso(totalSpent)}
            </Text>
          </View>
        </View>
        <ProgressBar pct={summaryRatio} color={progressColor(summaryRatio)} trackStyle={styles.summaryProgressTrack} fillStyle={styles.summaryProgressFill} />
      </View>

      <TouchableOpacity style={styles.cycleRow} onPress={handleCycleDayPress}>
        <Text style={styles.cycleLabel}>Budget Cycle Start Day</Text>
        <View style={styles.cycleDayButton}>
          <Text style={styles.cycleDayText}>{cycleStartDay}</Text>
        </View>
      </TouchableOpacity>

      {categories.length === 0 ? (
        <Text style={styles.empty}>No categories found.</Text>
      ) : (
        <View style={styles.rowsCard}>
          {categories.map((category, index) => {
            const status = statusById[category.id];
            const hasLimit = category.monthly_budget > 0;
            const spent = status?.spent ?? 0;
            const fillRatio = hasLimit ? Math.min(spent / category.monthly_budget, 1) : 0;
            const usedPct = hasLimit ? Math.round(fillRatio * 100) : 0;

            return (
              <View key={category.id}>
                {index > 0 && <View style={styles.rowSeparator} />}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.row}
                  onPress={() => router.push({ pathname: '/budget-edit', params: { categoryId: category.id } })}
                >
                  <View style={[styles.iconBox, { backgroundColor: `${category.color}22` }]}>
                    <Text style={styles.iconEmoji}>{category.icon}</Text>
                  </View>
                  <View style={styles.rowMain}>
                    <View style={styles.rowTopLine}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {hasLimit && <Text style={styles.usedPercent}>{usedPct}% used</Text>}
                    </View>
                    {hasLimit && (
                      <ProgressBar pct={fillRatio} color={progressColor(fillRatio)} trackStyle={styles.rowProgressTrack} fillStyle={styles.rowProgressFill} />
                    )}
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.spentAmount}>{fmtPeso(spent)}</Text>
                    {hasLimit && <Text style={styles.ofAmount}>of {fmtPeso(category.monthly_budget)}</Text>}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.helperText}>Tap a category to edit its limit</Text>
    </ScrollView>
  );
}
