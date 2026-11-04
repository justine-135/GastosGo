import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";

export const profilesTable = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  incomeMode: text("income_mode", { enum: ["salary", "mixed", "target"] })
    .notNull()
    .default("salary"),
  savingsTarget: real("savings_target").notNull().default(0),
  // 1–28 to stay within every month's valid day range
  budgetCycleStart: integer("budget_cycle_start").notNull().default(1),
  currency: text("currency").notNull().default("PHP"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export type Profile = typeof profilesTable.$inferSelect;
export type NewProfile = typeof profilesTable.$inferInsert;
