import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavingsGap } from "../../hooks/useSavingsGap";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatCurrency } from "../../lib/formatCurrency";
import { categoryColors } from "../../theme";
import styles from "./insights.styles";

export default function InsightsScreen() {
  const { data, isLoading } = useSavingsGap();
  const budgetHealth = data?.budgetHealth ?? [];

  const totalSpent = budgetHealth.reduce((s, c) => s + c.spent, 0);
  const topCategories = [...budgetHealth]
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Insights</Text>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent This Cycle</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalSpent)}</Text>
        </View>

        <SectionHeader title="Spending by Category" />
        {topCategories.length === 0 ? (
          <EmptyState message="No spending recorded this cycle." />
        ) : (
          <View style={styles.card}>
            {topCategories.map((cat, i) => {
              const pct = totalSpent > 0 ? cat.spent / totalSpent : 0;
              const color = categoryColors[i % categoryColors.length];
              return (
                <View key={cat.id} style={[styles.row, i < topCategories.length - 1 && styles.rowBorder]}>
                  <Text style={styles.icon}>{cat.icon}</Text>
                  <View style={styles.info}>
                    <View style={styles.labelRow}>
                      <Text style={styles.name}>{cat.name}</Text>
                      <Text style={styles.amount}>{formatCurrency(cat.spent)}</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.pct}>{Math.round(pct * 100)}% of spending</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
