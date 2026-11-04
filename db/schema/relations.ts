import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { profilesTable } from "./profiles";
import { categoriesTable } from "./categories";
import { expensesTable } from "./expenses";
import { recurringRulesTable } from "./recurringRules";
import { incomeRecordsTable } from "./incomeRecords";

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  profile: one(profilesTable, {
    fields: [usersTable.id],
    references: [profilesTable.userId],
  }),
  categories: many(categoriesTable),
  expenses: many(expensesTable),
  recurringRules: many(recurringRulesTable),
  incomeRecords: many(incomeRecordsTable),
}));

export const profilesRelations = relations(profilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
  }),
}));

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [categoriesTable.userId],
    references: [usersTable.id],
  }),
  expenses: many(expensesTable),
  recurringRules: many(recurringRulesTable),
}));

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [expensesTable.userId],
    references: [usersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [expensesTable.categoryId],
    references: [categoriesTable.id],
  }),
}));

export const recurringRulesRelations = relations(recurringRulesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [recurringRulesTable.userId],
    references: [usersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [recurringRulesTable.categoryId],
    references: [categoriesTable.id],
  }),
}));

export const incomeRecordsRelations = relations(incomeRecordsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [incomeRecordsTable.userId],
    references: [usersTable.id],
  }),
}));
