import { ScrollView, View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProfile, upsertProfile } from "../../db/queries/profiles";
import { useAuthStore } from "../../store/authStore";
import styles from "./settings.styles";

type IncomeMode = "salary" | "mixed" | "target";

const INCOME_MODES: { id: IncomeMode; label: string; desc: string }[] = [
  { id: "salary", label: "Fixed Salary", desc: "Set monthly income once" },
  { id: "mixed", label: "Mixed / Freelance", desc: "Log income as it arrives" },
  { id: "target", label: "Spending Cap", desc: "No income needed" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: () => getProfile(userId!),
  });

  const [incomeMode, setIncomeMode] = useState<IncomeMode>("salary");
  const [salary, setSalary] = useState("0");
  const [target, setTarget] = useState("0");
  const [cycleStart, setCycleStart] = useState("1");

  useEffect(() => {
    if (!profile) return;
    setIncomeMode(profile.incomeMode as IncomeMode);
    setSalary(String(profile.monthlySalary ?? 0));
    setTarget(String(profile.savingsTarget));
    setCycleStart(String(profile.budgetCycleStart));
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("No user");
      return upsertProfile({
        userId,
        incomeMode,
        monthlySalary: incomeMode === "salary" ? parseFloat(salary) || 0 : null,
        savingsTarget: parseFloat(target) || 0,
        budgetCycleStart: Math.min(28, Math.max(1, parseInt(cycleStart) || 1)),
        currency: profile?.currency ?? "PHP",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.section}>Income Setup</Text>
        <View style={styles.card}>
          {INCOME_MODES.map((m, i) => (
            <Pressable
              key={m.id}
              style={[styles.modeRow, i < INCOME_MODES.length - 1 && styles.rowBorder]}
              onPress={() => setIncomeMode(m.id)}
            >
              <View style={styles.modeLeft}>
                <Text style={styles.modeLabel}>{m.label}</Text>
                <Text style={styles.modeDesc}>{m.desc}</Text>
              </View>
              <View style={[styles.radio, incomeMode === m.id && styles.radioSel]} />
            </Pressable>
          ))}
        </View>

        {incomeMode === "salary" && (
          <>
            <Text style={styles.section}>Monthly Salary</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
                placeholder="25000"
                placeholderTextColor="#C4B4A0"
              />
            </View>
          </>
        )}

        <Text style={styles.section}>
          {incomeMode === "target" ? "Spending Cap" : "Savings Target"}
        </Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
            placeholder="5000"
            placeholderTextColor="#C4B4A0"
          />
        </View>

        <Text style={styles.section}>Budget Cycle Starts On</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={cycleStart}
            onChangeText={setCycleStart}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#C4B4A0"
          />
          <Text style={styles.hint}>Day 1–28 of each month</Text>
        </View>

        <Pressable
          style={[styles.saveBtn, mutation.isPending && styles.saveBtnDisabled]}
          disabled={mutation.isPending}
          onPress={() => mutation.mutate()}
        >
          <Text style={styles.saveBtnText}>
            {mutation.isPending ? "Saving…" : mutation.isSuccess ? "Saved ✓" : "Save Changes"}
          </Text>
        </Pressable>

        <Text style={styles.section}>Data</Text>
        <View style={styles.card}>
          <Pressable
            style={[styles.navRow, styles.rowBorder]}
            onPress={() => router.push("/categories")}
          >
            <Text style={styles.navLabel}>📂  Manage Categories</Text>
            <Text style={styles.navArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.navRow} onPress={() => router.push("/trash")}>
            <Text style={styles.navLabel}>🗑  Deleted Expenses</Text>
            <Text style={styles.navArrow}>›</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
