import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { incomeRecordsTable, type NewIncomeRecord } from "../schema";

export async function getIncomeForMonth(userId: string, month: number, year: number) {
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

export async function insertIncome(values: NewIncomeRecord) {
  return db.insert(incomeRecordsTable).values(values);
}
