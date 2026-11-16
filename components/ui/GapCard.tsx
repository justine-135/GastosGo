import { View, Text, Pressable } from "react-native";
import { formatCurrency, formatCurrencySigned } from "../../lib/formatCurrency";
import type { GapResult } from "../../lib/savingsGap";
import styles from "./GapCard.styles";

type CardState = "on-track" | "warning" | "at-risk" | "no-data";

interface Props {
  gap: GapResult | null;
  incomeMode: "salary" | "mixed" | "target" | null;
  overBudgetCategories: string[];
  warningCategories: string[];
  onAddIncome?: () => void;
  compact?: boolean;
}

const BG: Record<CardState, string> = {
  "on-track": "#81B29A",
  "warning": "#E9C46A",
  "at-risk": "#E76F51",
  "no-data": "#8da1b9",
};

export function GapCard({ gap, incomeMode, overBudgetCategories, warningCategories, onAddIncome, compact }: Props) {
  let state: CardState = "no-data";
  let desc = "Set up your income mode to see your gap";

  if (gap && incomeMode) {
    if (gap.gap < 0 || overBudgetCategories.length > 0) {
      state = "at-risk";
      desc = overBudgetCategories.length
        ? `🚨 Over budget in: ${overBudgetCategories.join(", ")}`
        : "At risk — spending faster than planned";
    } else if (warningCategories.length > 0) {
      state = "warning";
      desc = `⚠️ Approaching limit in: ${warningCategories.join(", ")}`;
    } else {
      state = "on-track";
      desc = "On track — keep it up! 🎉";
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: BG[state] }, compact && styles.compact]}>
      <Text style={styles.label}>Spending Cap</Text>
      <Text style={styles.amount}>
        {gap && incomeMode ? formatCurrencySigned(gap.gap) : "—"}
      </Text>
      <Text style={styles.desc}>{desc}</Text>

      {!compact && (
        <>
          <View style={styles.row}>
            <View>
              <Text style={styles.miniLabel}>Spent</Text>
              <Text style={styles.miniVal}>{gap ? formatCurrency(gap.totalExpenses) : "₱0"}</Text>
            </View>
            <View>
              <Text style={styles.miniLabel}>{incomeMode === "target" ? "Cap" : "Income"}</Text>
              <Text style={styles.miniVal}>
                {gap
                  ? incomeMode === "target"
                    ? formatCurrency(gap.actualSavings + gap.totalExpenses)
                    : gap.incomeTotal !== null
                    ? formatCurrency(gap.incomeTotal)
                    : "—"
                  : "—"}
              </Text>
            </View>
            <View>
              <Text style={styles.miniLabel}>{incomeMode === "target" ? "Remaining" : "Target"}</Text>
              <Text style={styles.miniVal}>
                {gap && incomeMode
                  ? incomeMode === "target"
                    ? formatCurrency(gap.actualSavings)
                    : formatCurrency(gap.expectedSavings)
                  : "—"}
              </Text>
            </View>
          </View>

          {incomeMode === "mixed" && onAddIncome && (
            <Pressable style={styles.addIncomeBtn} onPress={onAddIncome}>
              <Text style={styles.addIncomeBtnText}>+ Add Income</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
