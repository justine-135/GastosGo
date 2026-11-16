import { and, eq, isNull } from "drizzle-orm";
import { db } from "../index";
import { categoriesTable, type NewCategory } from "../schema";

export async function getCategories(userId: string) {
  return db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.userId, userId), isNull(categoriesTable.deletedAt)));
}

export async function insertCategory(values: NewCategory) {
  return db.insert(categoriesTable).values(values);
}

export async function updateCategory(id: string, values: Partial<NewCategory>) {
  return db.update(categoriesTable).set(values).where(eq(categoriesTable.id, id));
}

export async function softDeleteCategory(id: string) {
  return db
    .update(categoriesTable)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(categoriesTable.id, id));
}
