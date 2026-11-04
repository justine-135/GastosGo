import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../client";
import { expensesTable, NewExpense } from "../schema";

type ExpensePatch = Partial<Omit<NewExpense, "id" | "userId" | "createdAt">>;

export function insertExpense(data: NewExpense) {
  return db.insert(expensesTable).values(data).returning();
}

export function updateExpense(id: string, patch: ExpensePatch) {
  return db.update(expensesTable).set(patch).where(eq(expensesTable.id, id)).returning();
}

export function deleteExpense(id: string) {
  return db.delete(expensesTable).where(eq(expensesTable.id, id));
}

export function getExpensesByMonth(userId: string, month: number, year: number) {
  // date column is ISO-8601 text; strftime extracts month/year
  return db
    .select()
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        eq(sql`cast(strftime('%m', ${expensesTable.date}) as integer)`, month),
        eq(sql`cast(strftime('%Y', ${expensesTable.date}) as integer)`, year)
      )
    )
    .orderBy(desc(expensesTable.date));
}

export function getExpensesByCategory(
  userId: string,
  categoryId: string,
  month: number,
  year: number
) {
  return db
    .select()
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        eq(expensesTable.categoryId, categoryId),
        eq(sql`cast(strftime('%m', ${expensesTable.date}) as integer)`, month),
        eq(sql`cast(strftime('%Y', ${expensesTable.date}) as integer)`, year)
      )
    )
    .orderBy(desc(expensesTable.date));
}

export function getRecentExpenses(userId: string, limit: number) {
  return db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.userId, userId))
    .orderBy(desc(expensesTable.date))
    .limit(limit);
}
