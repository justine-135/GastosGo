import { sql } from "drizzle-orm";
import { check, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const expensesTable = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
    // Financial: amount in user's chosen currency — never store raw card data alongside
    amount: real("amount").notNull(),
    categoryId: text("category_id").references(() => categoriesTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    merchant: text("merchant"),
    notes: text("notes"),
    paymentMethod: text("payment_method").notNull(),
    // ISO-8601 date string, min length enforced by check constraint
    date: text("date").notNull(),
    isRecurring: integer("is_recurring", { mode: "boolean" }).notNull().default(false),
    recurringRuleId: text("recurring_rule_id"),
    syncedAt: text("synced_at"),
    currency: text("currency").notNull().default("PHP"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (t) => [check("date_min_length", sql`length(${t.date}) >= 10`)]
);

export type Expense = typeof expensesTable.$inferSelect;
export type NewExpense = typeof expensesTable.$inferInsert;
