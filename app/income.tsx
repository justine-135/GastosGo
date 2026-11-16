import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { insertIncome, getIncomeForMonth } from "../db/queries/income";
import { generateId } from "../lib/crypto";
import { useAuthStore } from "../store/authStore";
import { formatCurrency } from "../lib/formatCurrency";
import styles from "./income.styles";

const SOURCES = [
  { id: "Salary", emoji: "💼", name: "Salary" },
  { id: "Freelance", emoji: "💻", name: "Freelance" },
  { id: "Others", emoji: "📦", name: "Others" },
] as const;
type Source = typeof SOURCES[number]["id"];

export default function IncomeScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<Source>("Salary");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: incomeRecords = [] } = useQuery({
    queryKey: ["income", userId, month, year],
    enabled: !!userId,
    queryFn: () => getIncomeForMonth(userId!, month, year),
  });
  const monthTotal = incomeRecords.reduce((s, r) => s + r.amount, 0);

  const mutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount);
      if (!amt || !userId) throw new Error("Invalid");
      await insertIncome({ id: generateId(), userId, amount: amt, source, month, year });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["income", userId, month, year] });
      router.back();
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.handle} />
      <Text style={styles.title}>Log Income</Text>
      <Text style={styles.sub}>
        {monthTotal > 0
          ? `${now.toLocaleString("default", { month: "long" })} total: ${formatCurrency(monthTotal)}`
          : "Add a salary or freelance payment for this month."}
      </Text>

      <View style={styles.inputWrap}>
        <Text style={styles.label}>Amount (₱)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#C4B4A0"
        />
      </View>

      <View style={styles.sourceWrap}>
        <Text style={styles.label}>Source</Text>
        <View style={styles.sourceRow}>
          {SOURCES.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.srcBtn, source === s.id && styles.srcBtnSel]}
              onPress={() => setSource(s.id)}
            >
              <Text style={styles.srcEmoji}>{s.emoji}</Text>
              <Text style={styles.srcName}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.btn, mutation.isPending && styles.btnDisabled]}
        disabled={mutation.isPending}
        onPress={() => mutation.mutate()}
      >
        <Text style={styles.btnText}>Add Income ✓</Text>
      </Pressable>
    </SafeAreaView>
  );
}
