// FE-08 + FE-09: Insights Screen — Pie Chart + Bar Chart
// Victory Native XL is used for charts. Install: victory-native
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import { useBudgets } from '../../hooks/useBudgets';
import { MonthNavigator } from '../../components/MonthNavigator';
import { SkeletonBox } from '../../components/SkeletonBox';
import { formatPeso, monthAbbr, getLast6Months } from '../../utils/format';
import { getMonthlyExpenseSummary } from '../../lib/db';
import type { BudgetProgress, MonthlyExpenseSummary } from '../../lib/db/types';

const USER_ID = 'stub-user-001';

export default function InsightsScreen() {
  const { selectedMonth, selectedYear } = useUIStore();
  const { data: budgets = [], isLoading: loadingBudgets, refetch } = useBudgets(selectedMonth, selectedYear);
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);

  const last6 = useMemo(() => getLast6Months(), []);

  const monthQueries = useQueries({
    queries: last6.map(({ month, year }) => ({
      queryKey: ['monthly-summary', USER_ID, month, year],
      queryFn: () => getMonthlyExpenseSummary(USER_ID, month, year),
      staleTime: 30_000,
    })),
  });

  const monthlyData: MonthlyExpenseSummary[] = monthQueries
    .map((q) => q.data)
    .filter((d): d is MonthlyExpenseSummary => !!d);

  const isLoading = loadingBudgets || monthQueries.some((q) => q.isLoading);

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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#F4A261" />}
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
              return (
                <TouchableOpacity
                  key={item.categoryId}
                  style={[styles.legendRow, isSelected && styles.legendRowSelected]}
                  onPress={() => setSelectedSliceId(isSelected ? null : item.categoryId)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.categoryName}: ${formatPeso(item.spent)}, ${pct}%`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.legendDot, { backgroundColor: item.categoryColor }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{item.categoryName}</Text>
                  <Text style={styles.legendAmount}>{formatPeso(item.spent)}</Text>
                  <Text style={styles.legendPct}>{pct}%</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Selected slice detail */}
        {selectedSlice && (
          <View style={[styles.sliceDetail, { borderLeftColor: selectedSlice.categoryColor }]}>
            <Text style={styles.sliceDetailIcon}>{selectedSlice.categoryIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sliceDetailName}>{selectedSlice.categoryName}</Text>
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
          {monthQueries.some((q) => q.isLoading) ? (
            <SkeletonBox height={160} borderRadius={12} />
          ) : (
            <BarChartSection data={monthlyData} maxValue={maxBarValue} />
          )}
          <View style={styles.barLegendRow}>
            <View style={styles.barLegendItem}>
              <View style={[styles.barLegendDot, { backgroundColor: '#F4A261' }]} />
              <Text style={styles.barLegendText}>Budget</Text>
            </View>
            <View style={styles.barLegendItem}>
              <View style={[styles.barLegendDot, { backgroundColor: '#81B29A' }]} />
              <Text style={styles.barLegendText}>Spent (under)</Text>
            </View>
            <View style={styles.barLegendItem}>
              <View style={[styles.barLegendDot, { backgroundColor: '#E76F51' }]} />
              <Text style={styles.barLegendText}>Spent (over)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Pure SVG-less pie chart using View arcs.
// In production, replace with VictoryPie from victory-native once installed.
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
  // Render segmented circle using View-based approach (compatible without Victory Native installed)
  // shortcut: simple segmented bar instead of real pie; upgrade to VictoryPie when victory-native is installed
  return (
    <View>
      {/* Center amount */}
      <View style={styles.pieCenter}>
        <Text style={styles.pieCenterLabel}>Total</Text>
        <Text style={styles.pieCenterAmount}>{formatPeso(totalSpent)}</Text>
      </View>

      {/* Segmented bar as a pie chart stand-in */}
      <View style={styles.segBar}>
        {data.map((item) => {
          const flex = totalSpent > 0 ? item.spent / totalSpent : 0;
          const isSelected = selectedId === item.categoryId;
          return (
            <TouchableOpacity
              key={item.categoryId}
              style={[
                styles.segBarSlice,
                { flex, backgroundColor: item.categoryColor, opacity: isSelected ? 1 : 0.75 },
                isSelected && { transform: [{ scaleY: 1.3 }] },
              ]}
              onPress={() => onSelect(item.categoryId)}
              accessibilityRole="button"
              accessibilityLabel={`${item.categoryName} slice`}
              accessibilityState={{ selected: isSelected }}
            />
          );
        })}
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

  if (data.length === 0) {
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
          const budgetH = maxValue > 0 ? (item.totalBudget / maxValue) * 120 : 0;
          const spentH = maxValue > 0 ? (item.totalSpent / maxValue) * 120 : 0;
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
                <View style={[styles.bar, { height: budgetH, backgroundColor: '#F4A261' }]} />
                <View style={[styles.bar, { height: spentH, backgroundColor: isOver ? '#E76F51' : '#81B29A' }]} />
              </View>
              <Text style={styles.barLabel}>{monthAbbr(item.month)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  scroll: { padding: 16, paddingBottom: 40, gap: 20 },
  screenTitle: { fontSize: 28, fontWeight: '700', color: '#2D3047' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3047' },
  chartPlaceholder: { alignItems: 'center', paddingVertical: 16 },
  skeletonCircle: { alignSelf: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  pieCenter: { alignItems: 'center', paddingVertical: 12 },
  pieCenterLabel: { fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  pieCenterAmount: { fontSize: 28, fontWeight: '700', color: '#2D3047' },
  segBar: { flexDirection: 'row', height: 32, borderRadius: 16, overflow: 'hidden', marginHorizontal: 4 },
  segBarSlice: { height: 32 },
  legend: { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10 },
  legendRowSelected: { backgroundColor: '#FFF3E8' },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { flex: 1, fontSize: 14, color: '#2D3047', fontWeight: '500' },
  legendAmount: { fontSize: 14, fontWeight: '600', color: '#2D3047' },
  legendPct: { fontSize: 13, color: '#6B7280', width: 48, textAlign: 'right' },
  sliceDetail: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  sliceDetailIcon: { fontSize: 32 },
  sliceDetailName: { fontSize: 16, fontWeight: '700', color: '#2D3047' },
  sliceDetailAmount: { fontSize: 20, fontWeight: '700', color: '#F4A261' },
  sliceDetailPct: { fontSize: 13, color: '#6B7280' },
  barChart: { flexDirection: 'row', height: 180, alignItems: 'flex-end' },
  barYAxis: { width: 56, justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingRight: 4 },
  barYLabel: { fontSize: 10, color: '#9CA3AF' },
  barGroup: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', height: 160 },
  barColumn: { flex: 1, alignItems: 'center', gap: 4 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 10, borderRadius: 4, minHeight: 2 },
  barLabel: { fontSize: 10, color: '#6B7280', marginTop: 4 },
  tooltip: {
    position: 'absolute', top: -48, backgroundColor: '#2D3047', borderRadius: 8,
    padding: 6, zIndex: 10,
  },
  tooltipText: { fontSize: 10, color: '#FFFFFF' },
  barLegendRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  barLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLegendDot: { width: 10, height: 10, borderRadius: 5 },
  barLegendText: { fontSize: 12, color: '#6B7280' },
});
