import { and, eq, sql, sum } from "drizzle-orm";
import { db } from "../client";
import { expensesTable, incomeRecordsTable, profilesTable } from "../schema";

export type SavingsGap = {
  totalIncome: number;
  totalSpent: number;
  expectedSavings: number;
  actualSavings: number;
  gap: number;
};

export async function getSavingsGap(
  userId: string,
  month: number,
  year: number
): Promise<SavingsGap> {
  const [incomeRow] = await db
    .select({ total: sum(incomeRecordsTable.amount) })
    .from(incomeRecordsTable)
    .where(
      and(
        eq(incomeRecordsTable.userId, userId),
        eq(incomeRecordsTable.month, month),
        eq(incomeRecordsTable.year, year)
      )
    );

  const [spentRow] = await db
    .select({ total: sum(expensesTable.amount) })
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        eq(sql`cast(strftime('%m', ${expensesTable.date}) as integer)`, month),
        eq(sql`cast(strftime('%Y', ${expensesTable.date}) as integer)`, year)
      )
    );

  const [profileRow] = await db
    .select({ savingsTarget: profilesTable.savingsTarget })
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId));

  const totalIncome = Number(incomeRow?.total ?? 0);
  const totalSpent = Number(spentRow?.total ?? 0);
  const expectedSavings = profileRow?.savingsTarget ?? 0;
  const actualSavings = totalIncome - totalSpent;

  return {
    totalIncome,
    totalSpent,
    expectedSavings,
    actualSavings,
    gap: expectedSavings - actualSavings,
  };
}
