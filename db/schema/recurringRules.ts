import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const recurringRulesTable = sqliteTable("recurring_rules", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  categoryId: text("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  frequency: text("frequency", {
    enum: ["daily", "weekly", "monthly", "yearly"],
  }).notNull(),
  nextDueDate: text("next_due_date").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  paymentMethod: text("payment_method", {
    enum: ["cash", "gcash", "card", "bank_transfer"],
  }).notNull().default("cash"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export type RecurringRule = typeof recurringRulesTable.$inferSelect;
export type NewRecurringRule = typeof recurringRulesTable.$inferInsert;
