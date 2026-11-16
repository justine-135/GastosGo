import { and, eq, gte, isNull, lte, sum } from "drizzle-orm";
import { db } from "../index";
import { categoriesTable, expensesTable, incomeRecordsTable, recurringRulesTable } from "../schema";

export async function getCycleExpenses(userId: string, cycleStart: string, cycleEnd: string) {
  return db
    .select()
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        gte(expensesTable.date, cycleStart),
        lte(expensesTable.date, cycleEnd),
        isNull(expensesTable.deletedAt)
      )
    )
    .orderBy(expensesTable.date);
}

export async function getActiveRecurringRules(userId: string) {
  return db
    .select()
    .from(recurringRulesTable)
    .where(and(eq(recurringRulesTable.userId, userId), eq(recurringRulesTable.isActive, true)));
}

export async function getBudgetHealth(userId: string, cycleStart: string, cycleEnd: string) {
  const cats = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.userId, userId), isNull(categoriesTable.deletedAt)));

  const expenses = await getCycleExpenses(userId, cycleStart, cycleEnd);

  return cats.map((cat) => {
    const spent = expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((s, e) => s + e.amount, 0);
    return { ...cat, spent, pct: cat.monthlyBudget > 0 ? spent / cat.monthlyBudget : 0 };
  });
}

export async function getRecentExpenses(userId: string, limit = 5) {
  return db
    .select()
    .from(expensesTable)
    .where(and(eq(expensesTable.userId, userId), isNull(expensesTable.deletedAt)))
    .orderBy(expensesTable.date)
    .limit(limit);
}

export async function getIncomeForCycle(userId: string, month: number, year: number) {
  return db
    .select()
    .from(incomeRecordsTable)
    .where(
      and(
        eq(incomeRecordsTable.userId, userId),
        eq(incomeRecordsTable.month, month),
        eq(incomeRecordsTable.year, year)
      )
    );
}
