import { ScrollView, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavingsGap } from "../../hooks/useSavingsGap";
import { GapCard } from "../../components/ui/GapCard";
import { BudgetRow } from "../../components/ui/BudgetRow";
import { ExpenseItem } from "../../components/ui/ExpenseItem";
import { FAB } from "../../components/ui/FAB";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import styles from "./index.styles";

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading } = useSavingsGap();

  const profile = data?.profile ?? null;
  const gap = data?.gap ?? null;
  const budgetHealth = data?.budgetHealth ?? [];
  const expenses = data?.expenses ?? [];

  const overBudget = budgetHealth.filter((c) => c.pct >= 1).map((c) => c.name);
  const warning = budgetHealth.filter((c) => c.pct >= 0.8 && c.pct < 1).map((c) => c.name);

  const catMap = Object.fromEntries(budgetHealth.map((c) => [c.id, c]));
  const recent = [...expenses].reverse().slice(0, 5);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.greeting}>Good morning 👋</Text>
      <Text style={styles.sub}>
        {now.toLocaleString("default", { month: "long" })} {now.getFullYear()} · Day {now.getDate()} of {daysInMonth}
      </Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <GapCard
          gap={gap}
          incomeMode={profile?.incomeMode ?? null}
          overBudgetCategories={overBudget}
          warningCategories={warning}
          onAddIncome={() => router.push("/income")}
        />

        <SectionHeader title="Budget Health" />
        <View style={styles.card}>
          {budgetHealth.slice(0, 5).map((cat) => (
            <BudgetRow
              key={cat.id}
              icon={cat.icon}
              name={cat.name}
              pct={cat.pct}
            />
          ))}
        </View>

        <SectionHeader title="Recent" />
        <View style={styles.card}>
          {recent.length === 0 ? (
            <EmptyState message="No expenses yet. Tap + to add one." />
          ) : (
            recent.map((exp) => {
              const cat = catMap[exp.categoryId ?? ""];
              return (
                <ExpenseItem
                  key={exp.id}
                  icon={cat?.icon ?? "📦"}
                  categoryName={cat?.name ?? "Other"}
                  merchant={exp.merchant ?? cat?.name ?? "Expense"}
                  paymentMethod={exp.paymentMethod}
                  date={exp.date}
                  amount={exp.amount}
                  isRecurring={exp.isRecurring}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <FAB onPress={() => router.push("/add-expense")} />
    </SafeAreaView>
  );
}
