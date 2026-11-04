import { sql } from "drizzle-orm";
import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";

export const categoriesTable = sqliteTable("categories", {
  id: text("id").primaryKey(),
  // null userId = system default category visible to all users
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  monthlyBudget: real("monthly_budget").notNull().default(0),
  currency: text("currency").notNull().default("PHP"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
