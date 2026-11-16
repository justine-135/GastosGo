import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { eq } from "drizzle-orm";
import { db, DEFAULT_CATEGORIES } from "../../db";
import { categoriesTable, profilesTable } from "../../db/schema";
import { generateId } from "../../lib/crypto";
import { formatCurrency } from "../../lib/formatCurrency";
import { useAuthStore } from "../../store/authStore";
import { queryClient } from "../../lib/queryClient";
import styles from "./setup.styles";

type IncomeMode = "salary" | "mixed" | "target";

export default function OnboardingSetupScreen() {
  const { mode } = useLocalSearchParams<{ mode: IncomeMode }>();
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [salary, setSalary] = useState("25000");
  const [target, setTarget] = useState("5000");

  const salaryNum = parseFloat(salary) || 0;
  const targetNum = parseFloat(target) || 0;

  const title = mode === "salary" ? "Set your income" : mode === "mixed" ? "Set your savings target" : "Set your spending cap";
  const targetLabel = mode === "target" ? "Spending Cap (₱)" : "Savings Target (₱)";

  async function handleStart() {
    if (!userId) return;

    // Check if profile already exists
    const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    if (existing.length === 0) {
      await db.insert(profilesTable).values({
        userId,
        incomeMode: mode,
        monthlySalary: mode === "salary" ? salaryNum : null,
        savingsTarget: targetNum,
        budgetCycleStart: 1,
        currency: "PHP",
      });

      // Seed default categories
      const existing = await db.select().from(categoriesTable).limit(1);
      if (existing.length === 0) {
        await db.insert(categoriesTable).values(
          DEFAULT_CATEGORIES.map((cat) => ({
            id: generateId(),
            userId,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            monthlyBudget: cat.monthlyBudget,
            currency: "PHP",
          }))
        );
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    router.replace("/(tabs)");
  }

  const spendBudget = salaryNum - targetNum;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <Text style={styles.subtitle}>
        {mode === "salary" && "We use this to calculate how much you can save each month."}
        {mode === "mixed" && "Log income entries as they arrive. We'll track your savings gap against this target."}
        {mode === "target" && "No income logging needed. Tell us the most you want to spend this month."}
      </Text>

      {mode === "salary" && (
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Monthly Salary (₱)</Text>
          <TextInput
            style={styles.input}
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            placeholder="25000"
          />
        </View>
      )}

      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>{targetLabel}</Text>
        <TextInput
          style={styles.input}
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
          placeholder="5000"
        />
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Preview</Text>
        {mode === "salary" && (
          <View style={styles.previewRows}>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Monthly salary</Text>
              <Text style={styles.previewVal}>{formatCurrency(salaryNum)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Savings target</Text>
              <Text style={styles.previewVal}>{formatCurrency(targetNum)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Spending budget</Text>
              <Text style={[styles.previewVal, { color: spendBudget >= 0 ? "#81B29A" : "#E76F51" }]}>
                {formatCurrency(spendBudget)}
              </Text>
            </View>
          </View>
        )}
        {mode === "mixed" && (
          <Text style={styles.previewText}>
            Log income entries as they arrive. We'll track how close you are to your{" "}
            <Text style={styles.previewBold}>{formatCurrency(targetNum)}</Text> savings target.
          </Text>
        )}
        {mode === "target" && (
          <Text style={styles.previewText}>
            You can spend up to <Text style={styles.previewBold}>{formatCurrency(targetNum)}</Text> this month. The gap card will go red when you exceed this cap.
          </Text>
        )}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable style={styles.btn} onPress={handleStart}>
        <Text style={styles.btnText}>Get Started →</Text>
      </Pressable>
    </SafeAreaView>
  );
}
