import { sql } from "drizzle-orm";
import { check, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";

export const incomeRecordsTable = sqliteTable(
  "income_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
    // Financial: income amount in user's currency
    amount: real("amount").notNull(),
    source: text("source").notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (t) => [
    uniqueIndex("income_records_user_source_month_year_idx").on(
      t.userId,
      t.source,
      t.month,
      t.year
    ),
    check("month_range", sql`${t.month} >= 1 AND ${t.month} <= 12`),
  ]
);

export type IncomeRecord = typeof incomeRecordsTable.$inferSelect;
export type NewIncomeRecord = typeof incomeRecordsTable.$inferInsert;
