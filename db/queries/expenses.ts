import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "../index";
import { expensesTable, type NewExpense } from "../schema";
import { enqueueSync } from "./syncQueue";

export async function insertExpense(values: NewExpense) {
  await db.insert(expensesTable).values(values);
  await enqueueSync("insert", "expenses", values.id, values);
}

export async function softDeleteExpense(id: string) {
  await db.update(expensesTable).set({ deletedAt: new Date().toISOString() }).where(eq(expensesTable.id, id));
  const [row] = await db.select().from(expensesTable).where(eq(expensesTable.id, id)).limit(1);
  if (row) await enqueueSync("update", "expenses", id, row);
}

export async function restoreExpense(id: string) {
  await db.update(expensesTable).set({ deletedAt: null }).where(eq(expensesTable.id, id));
  const [row] = await db.select().from(expensesTable).where(eq(expensesTable.id, id)).limit(1);
  if (row) await enqueueSync("update", "expenses", id, row);
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
