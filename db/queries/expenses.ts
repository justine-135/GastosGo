import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "../index";
import { expensesTable, type NewExpense } from "../schema";

export async function insertExpense(values: NewExpense) {
  return db.insert(expensesTable).values(values);
}

export async function softDeleteExpense(id: string) {
  return db
    .update(expensesTable)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(expensesTable.id, id));
}

export async function restoreExpense(id: string) {
  return db
    .update(expensesTable)
    .set({ deletedAt: null })
    .where(eq(expensesTable.id, id));
}

export async function purgeExpense(id: string) {
  return db.delete(expensesTable).where(eq(expensesTable.id, id));
}

export async function getRecentlyDeleted(userId: string) {
  return db
    .select()
    .from(expensesTable)
    .where(and(eq(expensesTable.userId, userId), isNotNull(expensesTable.deletedAt)));
}
