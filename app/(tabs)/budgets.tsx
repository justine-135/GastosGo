import { ScrollView, View, Text, Modal, TextInput, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSavingsGap } from "../../hooks/useSavingsGap";
import { updateCategory } from "../../db/queries/categories";
import { formatCurrency } from "../../lib/formatCurrency";
import { FAB } from "../../components/ui/FAB";
import type { Category } from "../../db/schema";
import styles from "./budgets.styles";

type BudgetItem = Category & { spent: number; pct: number };

function CatRow({
  cat,
  isLast,
  onPress,
}: {
  cat: BudgetItem;
  isLast: boolean;
  onPress: (c: BudgetItem) => void;
}) {
  const hasBudget = cat.monthlyBudget > 0;
  const pct = hasBudget ? Math.min(cat.pct * 100, 100) : 0;
  const pctColor = cat.pct >= 1 ? "#E76F51" : cat.pct >= 0.8 ? "#d97706" : "#6B7280";
  const barColor = cat.pct >= 1 ? "#E76F51" : cat.pct >= 0.8 ? "#E9C46A" : "#81B29A";

  return (
    <Pressable style={[styles.catRow, !isLast && styles.rowBorder]} onPress={() => onPress(cat)}>
      <View style={[styles.catBadge, { backgroundColor: cat.color + "22" }]}>
        <Text style={styles.catIcon}>{cat.icon}</Text>
      </View>
      <View style={styles.catInfo}>
        <View style={styles.catNameRow}>
          <View style={styles.catNameWrap}>
            <Text style={styles.catName}>{cat.name}</Text>
            {cat.carryoverEnabled && <Text style={styles.carryoverTag}>↩ Carryover</Text>}
          </View>
          <Text style={[styles.catPct, { color: pctColor }]}>
            {hasBudget ? `${Math.round(pct)}%` : "—"}
          </Text>
        </View>
        {hasBudget ? (
          <>
            <View style={styles.catTrack}>
              <View style={[styles.catBar, { width: `${pct}%` as any, backgroundColor: barColor }]} />
            </View>
            <Text style={styles.catAmounts}>
              {formatCurrency(cat.spent)} · {formatCurrency(cat.monthlyBudget)} budget ·{" "}
              <Text style={styles.catRemaining}>
                {formatCurrency(Math.max(cat.monthlyBudget - cat.spent, 0))} left
              </Text>
            </Text>
          </>
        ) : (
          <Text style={styles.noBudget}>Tap to set a budget</Text>
        )}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function BudgetsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useSavingsGap();
  const budgetHealth = (data?.budgetHealth ?? []) as BudgetItem[];
  const expenses = data?.expenses ?? [];

  const [sheet, setSheet] = useState<BudgetItem | null>(null);
  const [editBudget, setEditBudget] = useState("");
  const [editCarryover, setEditCarryover] = useState(false);

  function openSheet(cat: BudgetItem) {
    setSheet(cat);
    setEditBudget(cat.monthlyBudget > 0 ? String(cat.monthlyBudget) : "");
    setEditCarryover(cat.carryoverEnabled);
  }

  const mutation = useMutation({
    mutationFn: () =>
      updateCategory(sheet!.id, {
        monthlyBudget: parseFloat(editBudget) || 0,
        carryoverEnabled: editCarryover,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setSheet(null);
    },
  });

  const totalBudget = budgetHealth.reduce((s, c) => s + c.monthlyBudget, 0);
  const totalSpent = budgetHealth.reduce((s, c) => s + c.spent, 0);
  const totalPct = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
  const remaining = Math.max(totalBudget - totalSpent, 0);
  const ovBarColor = budgetHealth.some((c) => c.pct >= 1)
    ? "#E76F51"
    : totalPct >= 0.8
    ? "#E9C46A"
    : "#A8DADC";

  const over = budgetHealth.filter((c) => c.monthlyBudget > 0 && c.pct >= 1);
  const warn = budgetHealth.filter((c) => c.monthlyBudget > 0 && c.pct >= 0.8 && c.pct < 1);
  const ok = budgetHealth.filter((c) => c.monthlyBudget > 0 && c.pct < 0.8);
  const unset = budgetHealth.filter((c) => c.monthlyBudget === 0);

  const sheetSpent = sheet?.spent ?? 0;
  const sheetBudget = parseFloat(editBudget) || (sheet?.monthlyBudget ?? 0);
  const sheetPct = sheetBudget > 0 ? Math.min(sheetSpent / sheetBudget, 1) : 0;
  const sheetBarColor = sheetPct >= 1 ? "#E76F51" : sheetPct >= 0.8 ? "#E9C46A" : "#81B29A";
  const catExpenses = expenses.filter((e) => e.categoryId === sheet?.id).slice(-4).reverse();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Budgets</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Dark overview card */}
        <View style={styles.overviewCard}>
          <Text style={styles.ovLabel}>Total Spent</Text>
          <View style={styles.ovRow}>
            <View>
              <Text style={styles.ovSpent}>{formatCurrency(totalSpent)}</Text>
              <Text style={styles.ovOf}>of {formatCurrency(totalBudget)} budgeted</Text>
            </View>
            <View style={styles.ovPctWrap}>
              <Text style={styles.ovPct}>{Math.round(totalPct * 100)}%</Text>
              <Text style={styles.ovPctLabel}>used</Text>
            </View>
          </View>
          <View style={styles.ovTrack}>
            <View
              style={[styles.ovBar, { width: `${totalPct * 100}%` as any, backgroundColor: ovBarColor }]}
            />
          </View>
          <View style={styles.ovStats}>
            <View>
              <Text style={styles.ovStatLbl}>Remaining</Text>
              <Text style={styles.ovStatVal}>{formatCurrency(remaining)}</Text>
            </View>
            <View>
              <Text style={[styles.ovStatLbl, { textAlign: "right" }]}>Over Budget</Text>
              <Text style={[styles.ovStatVal, { textAlign: "right" }]}>{over.length}</Text>
            </View>
          </View>
        </View>

        {over.length > 0 && (
          <>
            <Text style={styles.sectionHdr}>🚨  Over Budget</Text>
            <View style={styles.card}>
              {over.map((cat, i) => (
                <CatRow key={cat.id} cat={cat} isLast={i === over.length - 1} onPress={openSheet} />
              ))}
            </View>
          </>
        )}

        {warn.length > 0 && (
          <>
            <Text style={styles.sectionHdr}>⚠️  Approaching Limit</Text>
            <View style={styles.card}>
              {warn.map((cat, i) => (
                <CatRow key={cat.id} cat={cat} isLast={i === warn.length - 1} onPress={openSheet} />
              ))}
            </View>
          </>
        )}

        {ok.length > 0 && (
          <>
            <Text style={styles.sectionHdr}>✅  On Track</Text>
            <View style={styles.card}>
              {ok.map((cat, i) => (
                <CatRow key={cat.id} cat={cat} isLast={i === ok.length - 1} onPress={openSheet} />
              ))}
            </View>
          </>
        )}

        {unset.length > 0 && (
          <>
            <Text style={styles.sectionHdr}>No Budget Set</Text>
            <View style={styles.card}>
              {unset.map((cat, i) => (
                <CatRow key={cat.id} cat={cat} isLast={i === unset.length - 1} onPress={openSheet} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <FAB onPress={() => router.push("/categories")} />

      {/* Inline edit sheet */}
      <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHdr}>
              <View style={[styles.sheetIconBg, { backgroundColor: (sheet?.color ?? "#ccc") + "22" }]}>
                <Text style={styles.sheetIconText}>{sheet?.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetName}>{sheet?.name}</Text>
                <Text style={styles.sheetSub}>
                  {sheet?.monthlyBudget
                    ? `${formatCurrency(sheet.monthlyBudget)} / month`
                    : "No budget set"}
                </Text>
              </View>
              <Pressable style={styles.sheetClose} onPress={() => setSheet(null)}>
                <Text style={styles.sheetCloseText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.statRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{formatCurrency(sheetSpent)}</Text>
                  <Text style={styles.statLbl}>Spent</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxMid]}>
                  <Text style={styles.statVal}>
                    {sheetBudget > 0 ? formatCurrency(sheetBudget) : "—"}
                  </Text>
                  <Text style={styles.statLbl}>Budget</Text>
                </View>
                <View style={styles.statBox}>
                  <Text
                    style={[
                      styles.statVal,
                      { color: sheetBudget - sheetSpent < 0 ? "#E76F51" : "#2D3047" },
                    ]}
                  >
                    {sheetBudget > 0 ? formatCurrency(Math.max(sheetBudget - sheetSpent, 0)) : "—"}
                  </Text>
                  <Text style={styles.statLbl}>Remaining</Text>
                </View>
              </View>

              {sheetBudget > 0 && (
                <View style={styles.miniTrack}>
                  <View
                    style={[
                      styles.miniBar,
                      { width: `${sheetPct * 100}%` as any, backgroundColor: sheetBarColor },
                    ]}
                  />
                </View>
              )}

              {catExpenses.map((e) => (
                <View key={e.id} style={styles.miniExp}>
                  <View>
                    <Text style={styles.miniExpName}>{e.merchant ?? "Expense"}</Text>
                    <Text style={styles.miniExpMeta}>
                      {e.paymentMethod} · {e.date}
                    </Text>
                  </View>
                  <Text style={styles.miniExpAmt}>{formatCurrency(e.amount)}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <Text style={styles.inputLbl}>Monthly Budget (₱)</Text>
              <TextInput
                style={styles.inputField}
                value={editBudget}
                onChangeText={setEditBudget}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#C4B4A0"
              />

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>Budget Carryover</Text>
                  <Text style={styles.toggleDesc}>Roll unused budget to next month</Text>
                </View>
                <Switch
                  value={editCarryover}
                  onValueChange={setEditCarryover}
                  trackColor={{ false: "#E5D5C0", true: "#F4A261" }}
                  thumbColor="#fff"
                />
              </View>

              <Pressable
                style={[styles.saveBtn, mutation.isPending && { opacity: 0.5 }]}
                disabled={mutation.isPending}
                onPress={() => mutation.mutate()}
              >
                <Text style={styles.saveBtnText}>
                  {mutation.isPending ? "Saving…" : "Save Changes"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
