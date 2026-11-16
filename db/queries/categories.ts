import { and, eq, isNull } from "drizzle-orm";
import { db } from "../index";
import { categoriesTable, type NewCategory } from "../schema";
import { enqueueSync } from "./syncQueue";

export async function getCategories(userId: string) {
  return db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.userId, userId), isNull(categoriesTable.deletedAt)));
}

export async function insertCategory(values: NewCategory) {
  await db.insert(categoriesTable).values(values);
  await enqueueSync("insert", "categories", values.id, values);
}

export async function updateCategory(id: string, values: Partial<NewCategory>) {
  await db.update(categoriesTable).set(values).where(eq(categoriesTable.id, id));
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
  if (row) await enqueueSync("update", "categories", id, row);
}

export async function softDeleteCategory(id: string) {
  await db.update(categoriesTable).set({ deletedAt: new Date().toISOString() }).where(eq(categoriesTable.id, id));
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
  if (row) await enqueueSync("update", "categories", id, row);
}
