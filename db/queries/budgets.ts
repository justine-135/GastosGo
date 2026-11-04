import { and, eq, sql, sum } from "drizzle-orm";
import { db } from "../client";
import { categoriesTable, expensesTable } from "../schema";

export type BudgetProgress = {
  categoryId: string;
  categoryName: string;
  budget: number;
  spent: number;
  percent: number;
};

export async function getBudgetProgress(
  userId: string,
  month: number,
  year: number
): Promise<BudgetProgress[]> {
  const rows = await db
    .select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      budget: categoriesTable.monthlyBudget,
      spent: sum(expensesTable.amount),
    })
    .from(categoriesTable)
    .leftJoin(
      expensesTable,
      and(
        eq(expensesTable.categoryId, categoriesTable.id),
        eq(expensesTable.userId, userId),
        eq(sql`cast(strftime('%m', ${expensesTable.date}) as integer)`, month),
        eq(sql`cast(strftime('%Y', ${expensesTable.date}) as integer)`, year)
      )
    )
    .where(eq(categoriesTable.userId, userId))
    .groupBy(categoriesTable.id);

  return rows.map((r) => {
    const spent = Number(r.spent ?? 0);
    const budget = r.budget ?? 0;
    return {
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      budget,
      spent,
      percent: budget > 0 ? spent / budget : 0,
    };
  });
}
