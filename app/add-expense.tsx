import { View, Text, Pressable, TextInput, Switch, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "../db";
import { categoriesTable, expensesTable } from "../db/schema";
import { insertExpense } from "../db/queries/expenses";
import { insertRecurringRule } from "../db/queries/recurringRules";
import { useAddExpenseStore } from "../store/addExpenseStore";
import { useAuthStore } from "../store/authStore";
import { useCurrentCycle } from "../hooks/useCurrentCycle";
import { generateId } from "../lib/crypto";
import { formatCurrency } from "../lib/formatCurrency";
import { CategoryPicker } from "../features/expenses/CategoryPicker";
import { PaymentMethodPicker } from "../features/expenses/PaymentMethodPicker";
import { Numpad } from "../components/ui/Numpad";
import styles from "./add-expense.styles";

const STEP_DOTS = [1, 2, 3, 4] as const;

type Freq = "daily" | "weekly" | "monthly" | "yearly";
const FREQS: Freq[] = ["monthly", "weekly", "yearly"];

export default function AddExpenseModal() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const { start, end } = useCurrentCycle();
  const store = useAddExpenseStore();

  const cycleStart = start.toISOString().slice(0, 10);
  const cycleEnd = end.toISOString().slice(0, 10);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", userId],
    enabled: !!userId,
    queryFn: () =>
      db.select().from(categoriesTable).where(and(eq(categoriesTable.userId, userId!), isNull(categoriesTable.deletedAt))),
  });

  const { data: cycleExpenses = [] } = useQuery({
    queryKey: ["expenses", userId, cycleStart, cycleEnd],
    enabled: !!userId,
    queryFn: () =>
      db
        .select()
        .from(expensesTable)
        .where(and(eq(expensesTable.userId, userId!), gte(expensesTable.date, cycleStart), lte(expensesTable.date, cycleEnd), isNull(expensesTable.deletedAt))),
  });

  const spentByCategory: Record<string, number> = {};
  for (const exp of cycleExpenses) {
    if (exp.categoryId) spentByCategory[exp.categoryId] = (spentByCategory[exp.categoryId] ?? 0) + exp.amount;
  }

  const selectedCat = categories.find((c) => c.id === store.categoryId);
  const amountNum = parseFloat(store.amount) || 0;
  const today = new Date().toISOString().slice(0, 10);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No user");
      if (store.isRecurring) {
        await insertRecurringRule({
          id: generateId(),
          userId,
          name: store.merchant || selectedCat?.name || "Bill",
          amount: amountNum,
          categoryId: store.categoryId ?? undefined,
          paymentMethod: store.paymentMethod!,
          frequency: store.frequency ?? "monthly",
          nextDueDate: today,
          isActive: true,
        });
      } else {
        await insertExpense({
          id: generateId(),
          userId,
          amount: amountNum,
          categoryId: store.categoryId ?? undefined,
          merchant: store.merchant || selectedCat?.name || undefined,
          notes: store.notes || undefined,
          paymentMethod: store.paymentMethod!,
          date: today,
          isRecurring: false,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["expenses"] });
      store.reset();
      router.back();
    },
  });

  function goBack() {
    if (store.step === 1) { store.reset(); router.back(); }
    else store.setStep((store.step - 1) as 1 | 2 | 3 | 4);
  }

  // Compute budget impact for confirm screen
  const spentInCat = selectedCat ? (spentByCategory[selectedCat.id] ?? 0) : 0;
  const newTotal = spentInCat + amountNum;
  const pct = selectedCat && selectedCat.monthlyBudget > 0 ? newTotal / selectedCat.monthlyBudget : 0;
  const remaining = selectedCat ? selectedCat.monthlyBudget - newTotal : 0;

  let impactMsg = "";
  if (selectedCat) {
    if (pct >= 1) impactMsg = `⚠️ Over budget! ${selectedCat.name} will be ${formatCurrency(Math.abs(remaining))} over the ${formatCurrency(selectedCat.monthlyBudget)} limit.`;
    else if (pct >= 0.8) impactMsg = `⚠️ ${Math.round(pct * 100)}% used. ${formatCurrency(remaining)} left in ${selectedCat.name} after this.`;
    else impactMsg = `${selectedCat.name}: ${formatCurrency(newTotal)} of ${formatCurrency(selectedCat.monthlyBudget)} used (${Math.round(pct * 100)}%). ${formatCurrency(remaining)} remaining.`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>
          {store.step === 1 ? "Category" : store.step === 2 ? "Amount" : store.step === 3 ? "Payment Method" : "Confirm"}
        </Text>
      </View>

      {/* Step dots */}
      <View style={styles.dots}>
        {STEP_DOTS.map((n) => (
          <View key={n} style={[styles.dot, store.step === n && styles.dotActive]} />
        ))}
      </View>

      {/* Step 1: Category */}
      {store.step === 1 && (
        <>
          <Text style={styles.stepSub}>What did you spend on?</Text>
          <ScrollView style={{ flex: 1 }}>
            <CategoryPicker
              categories={categories}
              spentByCategory={spentByCategory}
              selectedId={store.categoryId}
              onSelect={store.setCategoryId}
            />
          </ScrollView>
          <Pressable
            style={[styles.btn, !store.categoryId && styles.btnDisabled]}
            disabled={!store.categoryId}
            onPress={() => store.setStep(2)}
          >
            <Text style={styles.btnText}>Next →</Text>
          </Pressable>
        </>
      )}

      {/* Step 2: Amount */}
      {store.step === 2 && (
        <>
          {selectedCat && (
            <Text style={styles.stepSub}>{selectedCat.icon} <Text style={{ fontWeight: "600" }}>{selectedCat.name}</Text></Text>
          )}
          <View style={styles.amountStage}>
            <Text style={styles.amountLabel}>How much?</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>₱</Text>
              <Text style={styles.amountDisplay}>{store.amount || "0"}</Text>
            </View>
          </View>
          <Numpad
            value={store.amount}
            onChange={store.setAmount}
            onNext={() => store.setStep(3)}
            nextDisabled={amountNum <= 0}
          />
        </>
      )}

      {/* Step 3: Payment Method */}
      {store.step === 3 && (
        <>
          <Text style={styles.payHeader}>
            ₱{amountNum.toLocaleString()} · <Text style={{ fontSize: 16, color: "#6b7280" }}>{selectedCat?.name}</Text>
          </Text>
          <PaymentMethodPicker selected={store.paymentMethod} onSelect={store.setPaymentMethod} />
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Merchant / Notes (optional)</Text>
            <TextInput
              style={styles.input}
              value={store.merchant}
              onChangeText={store.setMerchant}
              placeholder="e.g. Jollibee, Grab, SM"
              placeholderTextColor="#C4B4A0"
            />
          </View>
          <View style={{ flex: 1 }} />
          <Pressable
            style={[styles.btn, !store.paymentMethod && styles.btnDisabled]}
            disabled={!store.paymentMethod}
            onPress={() => store.setStep(4)}
          >
            <Text style={styles.btnText}>Review →</Text>
          </Pressable>
        </>
      )}

      {/* Step 4: Confirm */}
      {store.step === 4 && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.confirmCard}>
            <Text style={styles.confIcon}>{selectedCat?.icon ?? "📦"}</Text>
            <Text style={styles.confAmt}>{formatCurrency(amountNum)}</Text>
            <View style={styles.confRow}><Text style={styles.confLbl}>Category</Text><Text style={styles.confVal}>{selectedCat?.name ?? "—"}</Text></View>
            <View style={styles.confRow}><Text style={styles.confLbl}>Payment</Text><Text style={styles.confVal}>{store.paymentMethod ?? "—"}</Text></View>
            <View style={styles.confRow}><Text style={styles.confLbl}>Merchant</Text><Text style={styles.confVal}>{store.merchant || "—"}</Text></View>
            <View style={styles.confRow}><Text style={styles.confLbl}>Date</Text><Text style={styles.confVal}>Today · {today}</Text></View>
          </View>

          {impactMsg ? (
            <View style={styles.impactCard}>
              <Text style={styles.impactLabel}>Budget Impact</Text>
              <Text style={styles.impactText}>{impactMsg}</Text>
            </View>
          ) : null}

          <View style={styles.recurCard}>
            <View style={styles.recurRow}>
              <View>
                <Text style={styles.recurTitle}>Repeat this bill</Text>
                <Text style={styles.recurSub}>Save as a recurring rule</Text>
              </View>
              <Switch value={store.isRecurring} onValueChange={store.setIsRecurring} />
            </View>
            {store.isRecurring && (
              <View style={styles.freqRow}>
                {FREQS.map((f) => (
                  <Pressable
                    key={f}
                    style={[styles.freqChip, store.frequency === f && styles.freqChipSel]}
                    onPress={() => store.setFrequency(f)}
                  >
                    <Text style={[styles.freqText, store.frequency === f && styles.freqTextSel]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Pressable style={styles.btn} onPress={() => mutation.mutate()} disabled={mutation.isPending}>
            <Text style={styles.btnText}>{store.isRecurring ? "Save Recurring Bill ✓" : "Log Expense ✓"}</Text>
          </Pressable>
          <Pressable style={styles.btnSecondary} onPress={() => { store.reset(); router.back(); }}>
            <Text style={styles.btnSecondaryText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
