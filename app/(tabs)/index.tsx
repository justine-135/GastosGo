import { useCallback, useRef, useEffect, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { setOnExpenseSaved, notifyExpenseSaved } from '../../src/lib/expenseSavedBridge';
import { getDb } from '../../src/db';
import { listExpenses, softDeleteExpense, ExpenseRow } from '../../src/db/expenses';
import { listCategories, CategoryRow } from '../../src/db/categories';
import { loadSettings, AppSettings } from '../../src/db/settings';
import { getLatestCycleSnapshot } from '../../src/db/cycleSnapshots';
import { listUpcomingRules, RecurringRuleRow, markAsPaid, skipRule } from '../../src/db/recurringRules';
import { computeMissedCount } from '../../src/utils/computeNextDueDate';
import { cycleStartDate } from '../../src/utils/cycleDate';
import { computeGap, GapResult } from '../../src/utils/computeGap';
import { remainingSpendable, spendingCap, budgetedSpent } from '../../src/utils/computeSpendingCap';
import { fmtPeso, todayStr } from '../../src/utils/fmtPeso';
import { fmtDate } from '../../src/utils/fmtDate';
import { colors } from '../../src/theme';
import { styles } from '../../src/screens/tabs/index.styles';

interface HomeData {
  gap: GapResult;
  income: number;
  totalExpenses: number;
  spendable: number | null;
  cap: number;
  categories: CategoryRow[];
  expenses: ExpenseRow[];
  categoriesById: Record<string, CategoryRow>;
  settings: AppSettings;
  upcomingRules: RecurringRuleRow[];
}

function deriveIncome(settings: AppSettings): number {
  if (settings.incomeMode === 'salary') return settings.monthlySalary;
  if (settings.incomeMode === 'mixed') return settings.monthlySalary + settings.freelanceIncome;
  return settings.savingsTarget;
}

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

function useEnterAnimation(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translateY, scale]);

  return { opacity, transform: [{ translateY }, { scale }] };
}

export default function HomeScreen() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  const reload = useCallback(() => {
    const db = getDb();
    const settings = loadSettings(db);
    const today = todayStr();
    const since = cycleStartDate(today, settings.budgetCycleDay);
    const loaded = listExpenses(db, since);
    const allCategories = listCategories(db);
    const byId: Record<string, CategoryRow> = {};
    for (const category of allCategories) byId[category.id] = category;
    const snapshot = getLatestCycleSnapshot(db);
    const totalExpenses = loaded.reduce((sum, e) => sum + e.amount, 0);
    const gapInput = snapshot
      ? {
          incomeMode: snapshot.income_mode,
          monthlySalary: snapshot.monthly_salary,
          freelanceIncome: snapshot.freelance_income,
          expectedSavings: snapshot.expected_savings,
          savingsTarget: snapshot.savings_target,
          totalExpenses,
        }
      : { ...settings, totalExpenses };
    const gap = computeGap(gapInput);
    const hasBudgetedCategories = allCategories.some(c => c.monthly_budget > 0);
    const spendable = hasBudgetedCategories
      ? remainingSpendable(allCategories, loaded, settings.budgetCycleDay)
      : null;
    const cap = spendingCap(allCategories);
    const upcomingRules = listUpcomingRules(db, today);
    setHomeData({
      gap,
      income: deriveIncome(settings),
      totalExpenses,
      spendable,
      cap,
      categories: allCategories,
      expenses: loaded,
      categoriesById: byId,
      settings,
      upcomingRules,
    });
  }, []);

  useFocusEffect(reload);

  useEffect(() => {
    setOnExpenseSaved(reload);
    return () => setOnExpenseSaved(null);
  }, [reload]);

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
  const gapAnim = useEnterAnimation(60);
  const capAnim = useEnterAnimation(120);
  const billsAnim = useEnterAnimation(180);

  if (!homeData) return <View style={styles.container} />;

  const { gap, income, totalExpenses, spendable, cap, categories, expenses, categoriesById, upcomingRules } = homeData;
  const isOnTrack = gap.onTrack;
  const heroColor = isOnTrack ? colors.green : colors.red;
  const ringColor = isOnTrack ? colors.green : colors.red;

  const budgetedCategories = categories.filter(c => c.monthly_budget > 0);
  const categoryStatuses = budgetedSpent(expenses, categories);
  const recentExpenses = expenses.slice(0, 5);
  const spentSoFar = cap - (spendable ?? 0);
  const capPct = cap > 0 ? Math.min(1, spentSoFar / cap) : 0;
  const barFillColor = capPct >= 1 ? colors.red : capPct >= 0.75 ? colors.amber : colors.green;

  function dueLabel(nextDueDate: string): { text: string; color: string } {
    if (nextDueDate < today) return { text: 'Overdue', color: colors.red };
    if (nextDueDate === today) return { text: 'Due today', color: colors.amber };
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    if (nextDueDate === tomorrowStr) return { text: 'Tomorrow', color: colors.navy };
    return { text: fmtDate(nextDueDate, today), color: colors.gray };
  }

  function handleMarkAsPaid(ruleId: string) {
    markAsPaid(getDb(), ruleId);
    reload();
    notifyExpenseSaved();
  }

  function handleSkip(ruleId: string) {
    skipRule(getDb(), ruleId);
    reload();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.largeTitle}>Home</Text>
      <Animated.View style={[styles.gapCard, gapAnim]}>
        <View style={[styles.gapRing, { borderColor: ringColor }]} />
        <View style={[styles.gapDot, { backgroundColor: ringColor }]} />

        <Text style={styles.gapLabel}>SAVINGS GAP</Text>
        <Text style={[styles.gapAmount, { color: heroColor }]}>
          {gap.gap < 0 ? '−' : ''}{fmtPeso(Math.abs(gap.gap))}
        </Text>

        <View style={[styles.statusPill, { backgroundColor: isOnTrack ? colors.greenBg : colors.redBg }]}>
          <Text style={[styles.statusPillText, { color: isOnTrack ? colors.green : colors.red }]}>
            {isOnTrack ? '✓ On Track' : '⚠ At Risk'}
          </Text>
        </View>
        <Text style={styles.gapDescription}>
          {isOnTrack
            ? 'You are within your savings target this cycle.'
            : 'Your spending exceeds your savings target.'}
        </Text>

        <View style={styles.detailRows}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Income</Text>
            <Text style={styles.detailValue}>{fmtPeso(income)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Spent</Text>
            <Text style={styles.detailValue}>{fmtPeso(totalExpenses)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expected Savings</Text>
            <Text style={styles.detailValue}>{fmtPeso(gap.expectedSavings)}</Text>
          </View>
        </View>
      </Animated.View>

      {spendable !== null && (
        <Animated.View style={[styles.capCard, capAnim]}>
          <View style={styles.capArc} />

          <View style={styles.capHeader}>
            <View>
              <Text style={styles.capCardLabel}>SPENDING CAP</Text>
              <Text style={styles.capSubLabel}>Remaining this cycle</Text>
            </View>
            <View style={styles.capAmountBlock}>
              <Text style={styles.capAmount}>{fmtPeso(spendable)}</Text>
              <Text style={styles.capOfLabel}>of {fmtPeso(cap)} cap</Text>
            </View>
          </View>

          <ProgressBar pct={capPct} color={barFillColor} trackStyle={styles.progressTrack} fillStyle={styles.progressFill} />

          {budgetedCategories.map((category, index) => {
            const statusEntry = categoryStatuses.find(s => s.categoryId === category.id);
            const spent = statusEntry?.spent ?? 0;
            const remaining = category.monthly_budget - spent;
            const catPct = category.monthly_budget > 0 ? Math.min(1, spent / category.monthly_budget) : 0;
            const catFill = catPct >= 1 ? colors.red : catPct >= 0.75 ? colors.amber : colors.green;
            return (
              <View key={category.id} style={[styles.catRow, index === 0 && styles.catRowFirst]}>
                <Text style={styles.catEmoji}>{category.icon}</Text>
                <Text style={styles.catName}>{category.name}</Text>
                <ProgressBar pct={catPct} color={catFill} trackStyle={styles.catBarTrack} fillStyle={styles.catBarFill} />
                <Text style={[styles.catRemaining, remaining < 0 && { color: colors.red }]}>
                  {fmtPeso(remaining)}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      )}

      <Animated.View style={[styles.billsCard, billsAnim]}>
        <View style={styles.billsHeader}>
          <Text style={styles.billsHeaderTitle}>Upcoming Bills</Text>
          <Pressable onPress={() => router.push('/recurring-rules')}>
            <Text style={styles.billsSeeAll}>See All</Text>
          </Pressable>
        </View>
        {upcomingRules.length === 0 ? (
          <Pressable style={styles.billsEmpty} onPress={() => router.push('/recurring-rules')}>
            <Text style={styles.billsEmptyEmoji}>🔁</Text>
            <Text style={styles.billsEmptyText}>No upcoming bills</Text>
            <Text style={styles.billsEmptyMeta}>Tap to manage recurring rules →</Text>
          </Pressable>
        ) : (
          upcomingRules.map((rule, index) => {
            const category = rule.category_id ? categoriesById[rule.category_id] : undefined;
            const iconBg = `${category?.color ?? '#8E8E93'}22`;
            const due = dueLabel(rule.next_due_date);
            const missedCount = computeMissedCount(rule.next_due_date, today, rule.recurrence_day, rule.frequency);
            return (
              <View key={rule.id} style={[styles.billRow, index > 0 && styles.billRowSep]}>
                <View style={[styles.billIcon, { backgroundColor: iconBg }]}>
                  <Text style={styles.expenseEmoji}>{category?.icon ?? '📦'}</Text>
                </View>
                <View style={styles.billMain}>
                  <Text style={styles.billName}>{rule.name}</Text>
                  <View style={styles.billMeta}>
                    <Text style={[styles.billDueLabel, { color: due.color }]}>{due.text}</Text>
                    {missedCount > 0 && (
                      <View style={styles.missedBadge}>
                        <Text style={styles.missedBadgeText}>{missedCount} missed</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.billAmount}>{fmtPeso(rule.amount)}</Text>
                <View style={styles.billActions}>
                  <Pressable style={styles.billPayButton} onPress={() => handleMarkAsPaid(rule.id)}>
                    <Text style={styles.billPayText}>Pay</Text>
                  </Pressable>
                  <Pressable style={styles.billSkipButton} onPress={() => handleSkip(rule.id)}>
                    <Text style={styles.billSkipText}>Skip</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </Animated.View>

      <Text style={styles.recentHeader}>Recent</Text>

      <View style={styles.recentCard}>
        {recentExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptyMeta}>Tap + to log one.</Text>
          </View>
        ) : (
          recentExpenses.map((expense, index) => {
            const category = expense.category_id ? categoriesById[expense.category_id] : undefined;
            const iconBg = `${category?.color ?? '#8E8E93'}22`;
            return (
              <TouchableOpacity
                key={expense.id}
                onLongPress={() => handleDelete(expense)}
                activeOpacity={0.7}
              >
                <View style={[styles.expenseRow, index < recentExpenses.length - 1 && styles.expenseRowSep]}>
                  <View style={[styles.expenseIcon, { backgroundColor: iconBg }]}>
                    <Text style={styles.expenseEmoji}>{category?.icon ?? '📦'}</Text>
                  </View>
                  <View style={styles.expenseMain}>
                    <Text style={styles.expenseName}>{category?.name ?? 'Uncategorized'}</Text>
                    <Text style={styles.expenseMeta}>{fmtDate(expense.date, today)}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>−{fmtPeso(expense.amount)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}
