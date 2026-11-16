import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { profilesTable } from "../db/schema";
import { getBudgetHealth, getCycleExpenses, getIncomeForCycle } from "../db/queries/dashboard";
import { computeSavingsGap } from "../lib/savingsGap";
import { useAuthStore } from "../store/authStore";
import { useCurrentCycle } from "./useCurrentCycle";

export function useSavingsGap() {
  const userId = useAuthStore((s) => s.userId);
  const { start, end } = useCurrentCycle();

  const cycleStart = start.toISOString().slice(0, 10);
  const cycleEnd = end.toISOString().slice(0, 10);
  const month = start.getMonth() + 1;
  const year = start.getFullYear();

  return useQuery({
    queryKey: ["dashboard", userId, cycleStart, cycleEnd],
    enabled: !!userId,
    queryFn: async () => {
      const [profile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, userId!))
        .limit(1);

      if (!profile) return null;

      const expenses = await getCycleExpenses(userId!, cycleStart, cycleEnd);
      const incomeRecords = await getIncomeForCycle(userId!, month, year);
      const budgetHealth = await getBudgetHealth(userId!, cycleStart, cycleEnd);

      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      const incomeRecordsTotal = incomeRecords.reduce((s, r) => s + r.amount, 0);

      const gap = computeSavingsGap({
        incomeMode: profile.incomeMode,
        salaryAmount: profile.monthlySalary ?? 0,
        savingsTarget: profile.savingsTarget,
        totalExpenses,
        incomeRecordsTotal,
      });

      return { profile, expenses, incomeRecords, budgetHealth, gap };
    },
  });
}
