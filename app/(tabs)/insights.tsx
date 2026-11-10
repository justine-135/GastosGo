// FE-08 + FE-09: Insights Screen — Pie Chart + Bar Chart
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { styles } from './insights.styles';
import { colors } from '../../theme/index';
import { PolarChart, Pie } from 'victory-native';
import { runOnJS } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import { useBudgets } from '../../hooks/useBudgets';
import { MonthNavigator } from '../../components/MonthNavigator';
import { SkeletonBox } from '../../components/SkeletonBox';
import { formatPeso, monthAbbr, getLast6Months } from '../../utils/format';
import { getMultiMonthSummary } from '../../lib/db';
import type { BudgetProgress, MonthlyExpenseSummary } from '../../lib/db/types';
import { LOCAL_USER_ID } from '../../lib/constants';

const USER_ID = LOCAL_USER_ID;

export default function InsightsScreen() {
  const { selectedMonth, selectedYear } = useUIStore();
  const { data: budgets = [], isLoading: loadingBudgets, refetch } = useBudgets(selectedMonth, selectedYear);
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);

  const last6 = useMemo(() => getLast6Months(), []);

  // BE-04: single query instead of 6 individual round-trips
  const { data: monthlyData = [], isLoading: loadingMonths, refetch: refetchMonths } = useQuery({
    queryKey: ['multi-month-summary', USER_ID, last6],
    queryFn: () => getMultiMonthSummary(USER_ID, last6),
    staleTime: 30_000,
  });

  const isLoading = loadingBudgets || loadingMonths;

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const slicesWithSpend = budgets.filter((b) => b.spent > 0);

  const selectedSlice = selectedSliceId
    ? budgets.find((b) => b.categoryId === selectedSliceId) ?? null
    : null;

  const maxBarValue = monthlyData.length > 0
    ? Math.max(...monthlyData.map((m) => Math.max(m.totalSpent, m.totalBudget)), 1)
    : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { refetch(); refetchMonths(); }} tintColor={colors.light.primary} />}
      >
        <Text style={styles.screenTitle}>Insights</Text>
        <MonthNavigator />

        {/* --- Pie Chart Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>

          {isLoading ? (
            <View style={styles.chartPlaceholder}>
              <SkeletonBox width={200} height={200} borderRadius={100} style={styles.skeletonCircle} />
            </View>
          ) : slicesWithSpend.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No expenses this month</Text>
            </View>
          ) : (
            <PieChartSection
              data={slicesWithSpend}
              totalSpent={totalSpent}
              selectedId={selectedSliceId}
              onSelect={(id) => setSelectedSliceId(selectedSliceId === id ? null : id)}
            />
          )}
        </View>

        {/* Legend */}
        {!isLoading && slicesWithSpend.length > 0 && (
          <View style={styles.legend}>
            {slicesWithSpend.map((item) => {
              const pct = totalSpent > 0 ? ((item.spent / totalSpent) * 100).toFixed(1) : '0';
              const isSelected = selectedSliceId === item.categoryId;
              // FE-12: null guard for uncategorised expenses
              const label = item.categoryName || 'Uncategorised';
              const color = item.categoryColor || colors.light.mutedForeground;
              return (
                <TouchableOpacity
                  key={item.categoryId}
                  style={[styles.legendRow, isSelected && styles.legendRowSelected]}
                  onPress={() => setSelectedSliceId(isSelected ? null : item.categoryId)}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}: ${formatPeso(item.spent)}, ${pct}%`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{label}</Text>
                  <Text style={styles.legendAmount}>{formatPeso(item.spent)}</Text>
                  <Text style={styles.legendPct}>{pct}%</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Selected slice detail */}
        {selectedSlice && (
          <View style={[styles.sliceDetail, { borderLeftColor: selectedSlice.categoryColor || colors.light.mutedForeground }]}>
            <Text style={styles.sliceDetailIcon}>{selectedSlice.categoryIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sliceDetailName}>{selectedSlice.categoryName || 'Uncategorised'}</Text>
              <Text style={styles.sliceDetailAmount}>{formatPeso(selectedSlice.spent)}</Text>
              <Text style={styles.sliceDetailPct}>
                {totalSpent > 0 ? ((selectedSlice.spent / totalSpent) * 100).toFixed(1) : '0'}% of total
              </Text>
            </View>
          </View>
        )}

        {/* --- Bar Chart Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6-Month Overview</Text>
          {loadingMonths ? (
            <SkeletonBox height={160} borderRadius={12} />
          ) : (
            <BarChartSection data={monthlyData} maxValue={maxBarValue} />
          )}
          <View style={styles.barLegendRow}>
            <View style={styles.barLegendItem}>
              <View style={[styles.barLegendDot, { backgroundColor: colors.light.primary }]} />
              <Text style={styles.barLegendText}>Budget</Text>
            </View>
            <View style={styles.barLegendItem}>
              <View style={[styles.barLegendDot, { backgroundColor: colors.light.muted }]} />
              <Text style={styles.barLegendText}>Spent (under)</Text>
            </View>
            <View style={styles.barLegendItem}>
              <View style={[styles.barLegendDot, { backgroundColor: colors.light.destructive }]} />
              <Text style={styles.barLegendText}>Spent (over)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PieChartSection({
  data,
  totalSpent,
  selectedId,
  onSelect,
}: {
  data: BudgetProgress[];
  totalSpent: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // FE-12: null guard for categoryName/categoryColor on uncategorised expenses
  const chartData = data.map((item) => ({
    label: item.categoryName || 'Uncategorised',
    value: item.spent,
    color: item.categoryColor || colors.light.mutedForeground,
    id: item.categoryId,
  }));

  return (
    <View style={styles.pieWrapper}>
      <PolarChart
        data={chartData}
        labelKey="label"
        valueKey="value"
        colorKey="color"
        containerStyle={styles.polarChart}
      >
        <Pie.Chart innerRadius="50%">
          {({ slice }) => (
            <Pie.Slice
              animate={{ type: 'timing', duration: 400 }}
              // FE-10: dim unselected slices when one is active
              style={selectedId && slice.data.id !== selectedId ? styles.sliceDimmed : undefined}
              onPress={() => { 'worklet'; if (slice.data.id) runOnJS(onSelect)(slice.data.id); }}
            />
          )}
        </Pie.Chart>
      </PolarChart>

      {/* Center label overlaid on the donut hole */}
      <View style={styles.pieCenter} pointerEvents="none">
        <Text style={styles.pieCenterLabel}>Total</Text>
        <Text style={styles.pieCenterAmount}>{formatPeso(totalSpent)}</Text>
      </View>
    </View>
  );
}

function BarChartSection({
  data,
  maxValue,
}: {
  data: MonthlyExpenseSummary[];
  maxValue: number;
}) {
  const [tooltipMonth, setTooltipMonth] = useState<{ month: number; year: number } | null>(null);

  const allZero = data.every((d) => d.totalSpent === 0 && d.totalBudget === 0);

  if (data.length === 0 || allZero) {
    return <Text style={styles.emptyText}>No data available</Text>;
  }

  return (
    <View style={styles.barChart}>
      {/* Y-axis labels */}
      <View style={styles.barYAxis}>
        {[maxValue, maxValue * 0.5, 0].map((v) => (
          <Text key={v} style={styles.barYLabel}>{formatPeso(v)}</Text>
        ))}
      </View>

      <View style={styles.barGroup}>
        {data.map((item) => {
          const budgetH = maxValue > 0 ? (item.totalBudget / maxValue) * 160 : 0;
          const spentH = maxValue > 0 ? (item.totalSpent / maxValue) * 160 : 0;
          const isOver = item.totalSpent > item.totalBudget;
          const isTooltip = tooltipMonth?.month === item.month && tooltipMonth?.year === item.year;

          return (
            <TouchableOpacity
              key={`${item.month}-${item.year}`}
              style={styles.barColumn}
              onPress={() => setTooltipMonth(isTooltip ? null : { month: item.month, year: item.year })}
              accessibilityRole="button"
              accessibilityLabel={`${monthAbbr(item.month)}: Budget ${formatPeso(item.totalBudget)}, Spent ${formatPeso(item.totalSpent)}`}
            >
              {isTooltip && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>B: {formatPeso(item.totalBudget)}</Text>
                  <Text style={styles.tooltipText}>S: {formatPeso(item.totalSpent)}</Text>
                </View>
              )}
              <View style={styles.barPair}>
                <View style={[styles.bar, { height: budgetH, backgroundColor: colors.light.primary }]} />
                <View style={[styles.bar, { height: spentH, backgroundColor: isOver ? colors.light.destructive : colors.light.muted }]} />
              </View>
              <Text style={styles.barLabel}>{monthAbbr(item.month)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
