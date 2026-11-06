// Real Drizzle + expo-sqlite implementations.
// Function signatures are unchanged so callers (via lib/db/index.ts) need no edits.

import { randomUUID } from 'expo-crypto';
import { and, desc, eq, gte, isNull, lte, or, sql, sum } from 'drizzle-orm';
import { LOCAL_USER_ID } from '../constants';
import { db } from '../../db/client';
import {
  categoriesTable,
  expensesTable,
  incomeRecordsTable,
  profilesTable,
  recurringRulesTable,
  syncQueueTable,
} from '../../db/schema';
import type {
  Profile,
  Category,
  Expense,
  RecurringRule,
  IncomeRecord,
  BudgetProgress,
  SavingsGap,
  MonthlyExpenseSummary,
  InsertExpenseInput,
  InsertRecurringRuleInput,
  InsertProfileInput,
} from './types';

// --- helpers ---

function newId(): string {
  return randomUUID();
}

function isoNow(): string {
  return new Date().toISOString();
}

function monthFilter(month: number, year: number) {
  return and(
    eq(sql`cast(strftime('%m', ${expensesTable.date}) as integer)`, month),
    eq(sql`cast(strftime('%Y', ${expensesTable.date}) as integer)`, year)
  );
}

// --- Profile ---

// shortcut: profile row uses userId as PK; lib type has a separate 'id' field —
//           we echo userId into id. Upgrade when schema adds a surrogate id.
function rowToProfile(row: typeof profilesTable.$inferSelect): Profile {
  return {
    id: row.userId,
    userId: row.userId,
    monthlySalary: row.monthlySalary ?? null,
    expoPushToken: null,
    incomeMode: row.incomeMode,
    savingsTarget: row.savingsTarget,
    budgetCycleStart: row.budgetCycleStart,
    createdAt: row.updatedAt, // schema has no createdAt; use updatedAt as proxy
    updatedAt: row.updatedAt,
  };
}

export async function getProfile(): Promise<Profile | null> {
  const [row] = await db.select().from(profilesTable).limit(1);
  return row ? rowToProfile(row) : null;
}

export async function insertProfile(input: InsertProfileInput): Promise<Profile> {
  // The app has at most one profile row; use upsert keyed on a fixed userId.
  // Real multi-user version: caller passes userId.
  const userId = LOCAL_USER_ID;
  await db
    .insert(profilesTable)
    .values({
      userId,
      incomeMode: input.incomeMode,
      savingsTarget: input.savingsTarget ?? 0,
      budgetCycleStart: input.budgetCycleStart ?? 1,
      monthlySalary: input.monthlySalary ?? null,
      updatedAt: isoNow(),
    })
    .onConflictDoUpdate({
      target: profilesTable.userId,
      set: {
        incomeMode: input.incomeMode,
        savingsTarget: input.savingsTarget ?? 0,
        budgetCycleStart: input.budgetCycleStart ?? 1,
        monthlySalary: input.monthlySalary ?? null,
        updatedAt: isoNow(),
      },
    });
  const [row] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  return rowToProfile(row);
}

export async function updateProfile(input: Partial<InsertProfileInput>): Promise<Profile> {
  const [existing] = await db.select().from(profilesTable).limit(1);
  const userId = existing?.userId ?? LOCAL_USER_ID;
  const patch: Partial<typeof profilesTable.$inferInsert> = { updatedAt: isoNow() };
  if (input.incomeMode !== undefined) patch.incomeMode = input.incomeMode;
  if (input.savingsTarget !== undefined) patch.savingsTarget = input.savingsTarget;
  if (input.budgetCycleStart !== undefined) patch.budgetCycleStart = input.budgetCycleStart;
  if (input.monthlySalary !== undefined) patch.monthlySalary = input.monthlySalary;
  await db.update(profilesTable).set(patch).where(eq(profilesTable.userId, userId));
  const [row] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  return rowToProfile(row);
}

// --- Categories ---

function rowToCategory(row: typeof categoriesTable.$inferSelect): Category {
  return {
    id: row.id,
    userId: row.userId ?? '',
    name: row.name,
    icon: row.icon,
    color: row.color,
    monthlyBudget: row.monthlyBudget,
  };
}

export async function getCategories(): Promise<Category[]> {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  return rows.map(rowToCategory);
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, 'name' | 'color' | 'icon' | 'monthlyBudget'>>
): Promise<Category> {
  await db
    .update(categoriesTable)
    .set({ ...patch, updatedAt: isoNow() })
    .where(eq(categoriesTable.id, id));
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  return rowToCategory(row);
}

export async function insertCategory(input: Omit<Category, 'id' | 'userId'>): Promise<Category> {
  const id = newId();
  await db.insert(categoriesTable).values({
    id,
    userId: LOCAL_USER_ID,
    name: input.name,
    icon: input.icon,
    color: input.color,
    monthlyBudget: input.monthlyBudget,
    updatedAt: isoNow(),
  });
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  return rowToCategory(row);
}

// --- Expenses ---
// Expenses need categoryName + categoryColor via join.

type ExpenseRow = {
  id: string;
  userId: string;
  amount: number;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  merchant: string | null;
  notes: string | null;
  paymentMethod: string;
  date: string;
  isRecurring: boolean;
  recurringRuleId: string | null;
  syncedAt: string | null;
  createdAt: string;
};

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    userId: row.userId,
    amount: row.amount,
    categoryId: row.categoryId ?? '',
    categoryName: row.categoryName ?? '',
    categoryColor: row.categoryColor ?? '#888888',
    merchant: row.merchant,
    notes: row.notes,
    paymentMethod: row.paymentMethod as Expense['paymentMethod'],
    date: row.date,
    isRecurring: row.isRecurring,
    recurringRuleId: row.recurringRuleId,
    syncedAt: row.syncedAt,
    createdAt: row.createdAt,
  };
}

const expenseWithCategory = {
  id: expensesTable.id,
  userId: expensesTable.userId,
  amount: expensesTable.amount,
  categoryId: expensesTable.categoryId,
  categoryName: categoriesTable.name,
  categoryColor: categoriesTable.color,
  merchant: expensesTable.merchant,
  notes: expensesTable.notes,
  paymentMethod: expensesTable.paymentMethod,
  date: expensesTable.date,
  isRecurring: expensesTable.isRecurring,
  recurringRuleId: expensesTable.recurringRuleId,
  syncedAt: expensesTable.syncedAt,
  createdAt: expensesTable.createdAt,
};

export async function getExpensesByMonth(
  userId: string,
  month: number,
  year: number
): Promise<Expense[]> {
  const rows = await db
    .select(expenseWithCategory)
    .from(expensesTable)
    .leftJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(and(eq(expensesTable.userId, userId), monthFilter(month, year)))
    .orderBy(desc(expensesTable.date));
  return rows.map(rowToExpense);
}

export async function getRecentExpenses(userId: string, limit: number): Promise<Expense[]> {
  const rows = await db
    .select(expenseWithCategory)
    .from(expensesTable)
    .leftJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(eq(expensesTable.userId, userId))
    .orderBy(desc(expensesTable.date))
    .limit(limit);
  return rows.map(rowToExpense);
}

export async function insertExpense(input: InsertExpenseInput): Promise<Expense> {
  const userId = (await getProfile())?.userId ?? LOCAL_USER_ID;
  const id = newId();
  await db.insert(expensesTable).values({
    id,
    userId,
    amount: input.amount,
    categoryId: input.categoryId,
    merchant: input.merchant ?? null,
    notes: input.notes ?? null,
    paymentMethod: input.paymentMethod,
    date: input.date,
    isRecurring: input.isRecurring ?? false,
    recurringRuleId: input.recurringRuleId ?? null,
  });
  const [row] = await db
    .select(expenseWithCategory)
    .from(expensesTable)
    .leftJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(eq(expensesTable.id, id));
  return rowToExpense(row);
}

export async function updateExpense(id: string, input: Partial<InsertExpenseInput>): Promise<Expense> {
  const patch: Partial<typeof expensesTable.$inferInsert> = {};
  if (input.amount !== undefined) patch.amount = input.amount;
  if (input.categoryId !== undefined) patch.categoryId = input.categoryId;
  if (input.merchant !== undefined) patch.merchant = input.merchant;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.paymentMethod !== undefined) patch.paymentMethod = input.paymentMethod;
  if (input.date !== undefined) patch.date = input.date;
  if (input.isRecurring !== undefined) patch.isRecurring = input.isRecurring;
  if (input.recurringRuleId !== undefined) patch.recurringRuleId = input.recurringRuleId;
  await db.update(expensesTable).set(patch).where(eq(expensesTable.id, id));
  const [row] = await db
    .select(expenseWithCategory)
    .from(expensesTable)
    .leftJoin(categoriesTable, eq(expensesTable.categoryId, categoriesTable.id))
    .where(eq(expensesTable.id, id));
  return rowToExpense(row);
}

export async function deleteExpense(id: string): Promise<void> {
  await db.delete(expensesTable).where(eq(expensesTable.id, id));
}

// --- Budget Progress ---

export async function getBudgetProgress(
  userId: string,
  month: number,
  year: number
): Promise<BudgetProgress[]> {
  const rows = await db
    .select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      categoryColor: categoriesTable.color,
      categoryIcon: categoriesTable.icon,
      monthlyBudget: categoriesTable.monthlyBudget,
      spent: sum(expensesTable.amount),
    })
    .from(categoriesTable)
    .leftJoin(
      expensesTable,
      and(
        eq(expensesTable.categoryId, categoriesTable.id),
        eq(expensesTable.userId, userId),
        monthFilter(month, year)
      )
    )
    .where(or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId)))
    .groupBy(categoriesTable.id);

  return rows.map((r) => {
    const spent = Number(r.spent ?? 0);
    const budget = r.monthlyBudget ?? 0;
    return {
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      categoryColor: r.categoryColor,
      categoryIcon: r.categoryIcon,
      monthlyBudget: budget,
      spent,
      percent: budget > 0 ? (spent / budget) * 100 : 0,
    };
  });
}

// --- Savings Gap ---

export async function getSavingsGap(
  userId: string,
  month: number,
  year: number
): Promise<SavingsGap> {
  const profile = await getProfile();

  const [spentRow] = await db
    .select({ total: sum(expensesTable.amount) })
    .from(expensesTable)
    .where(and(eq(expensesTable.userId, userId), monthFilter(month, year)));

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

  const totalExpenses = Number(spentRow?.total ?? 0);
  // Fall back to monthlySalary stub if no income records recorded yet
  const totalIncome = Number(incomeRow?.total ?? profile?.monthlySalary ?? 0);
  const expectedSavings = profile?.savingsTarget ?? 0;
  const actualSavings = totalIncome - totalExpenses;

  return {
    expectedSavings,
    actualSavings,
    gap: actualSavings - expectedSavings,
    totalIncome,
    totalExpenses,
    incomeMode: profile?.incomeMode ?? 'salary',
  };
}

// --- Recurring Rules ---

function rowToRecurringRule(
  row: typeof recurringRulesTable.$inferSelect & {
    categoryName: string | null;
    categoryColor: string | null;
  }
): RecurringRule {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    amount: row.amount,
    categoryId: row.categoryId ?? '',
    categoryName: row.categoryName ?? '',
    categoryColor: row.categoryColor ?? '#888888',
    frequency: row.frequency,
    nextDueDate: row.nextDueDate,
    isActive: row.isActive,
    paymentMethod: row.paymentMethod as RecurringRule['paymentMethod'],
  };
}

const ruleWithCategory = {
  id: recurringRulesTable.id,
  userId: recurringRulesTable.userId,
  name: recurringRulesTable.name,
  amount: recurringRulesTable.amount,
  categoryId: recurringRulesTable.categoryId,
  categoryName: categoriesTable.name,
  categoryColor: categoriesTable.color,
  frequency: recurringRulesTable.frequency,
  nextDueDate: recurringRulesTable.nextDueDate,
  isActive: recurringRulesTable.isActive,
  paymentMethod: recurringRulesTable.paymentMethod,
  createdAt: recurringRulesTable.createdAt,
  updatedAt: recurringRulesTable.updatedAt,
};

export async function getRecurringRules(userId: string): Promise<RecurringRule[]> {
  const rows = await db
    .select(ruleWithCategory)
    .from(recurringRulesTable)
    .leftJoin(categoriesTable, eq(recurringRulesTable.categoryId, categoriesTable.id))
    .where(eq(recurringRulesTable.userId, userId));
  return rows.map(rowToRecurringRule);
}

export async function getRulesDueWithin(userId: string, days: number): Promise<RecurringRule[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const rows = await db
    .select(ruleWithCategory)
    .from(recurringRulesTable)
    .leftJoin(categoriesTable, eq(recurringRulesTable.categoryId, categoriesTable.id))
    .where(
      and(
        eq(recurringRulesTable.userId, userId),
        eq(recurringRulesTable.isActive, true),
        lte(recurringRulesTable.nextDueDate, cutoffIso)
      )
    );
  return rows.map(rowToRecurringRule);
}

export async function insertRecurringRule(input: InsertRecurringRuleInput): Promise<RecurringRule> {
  const userId = (await getProfile())?.userId ?? LOCAL_USER_ID;
  const id = newId();
  await db.insert(recurringRulesTable).values({
    id,
    userId,
    name: input.name,
    amount: input.amount,
    categoryId: input.categoryId,
    frequency: input.frequency,
    nextDueDate: input.firstDueDate,
    isActive: true,
    paymentMethod: input.paymentMethod as typeof recurringRulesTable.$inferInsert['paymentMethod'],
    updatedAt: isoNow(),
  });
  const [row] = await db
    .select(ruleWithCategory)
    .from(recurringRulesTable)
    .leftJoin(categoriesTable, eq(recurringRulesTable.categoryId, categoriesTable.id))
    .where(eq(recurringRulesTable.id, id));
  return rowToRecurringRule(row);
}

export async function updateRecurringRule(
  id: string,
  input: Partial<InsertRecurringRuleInput & { isActive: boolean }>
): Promise<RecurringRule> {
  const patch: Partial<typeof recurringRulesTable.$inferInsert> = { updatedAt: isoNow() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.amount !== undefined) patch.amount = input.amount;
  if (input.categoryId !== undefined) patch.categoryId = input.categoryId;
  if (input.frequency !== undefined) patch.frequency = input.frequency;
  if (input.firstDueDate !== undefined) patch.nextDueDate = input.firstDueDate;
  if (input.isActive !== undefined) patch.isActive = input.isActive;
  if (input.paymentMethod !== undefined) patch.paymentMethod = input.paymentMethod as typeof recurringRulesTable.$inferInsert['paymentMethod'];
  await db.update(recurringRulesTable).set(patch).where(eq(recurringRulesTable.id, id));
  const [row] = await db
    .select(ruleWithCategory)
    .from(recurringRulesTable)
    .leftJoin(categoriesTable, eq(recurringRulesTable.categoryId, categoriesTable.id))
    .where(eq(recurringRulesTable.id, id));
  return rowToRecurringRule(row);
}

export async function advanceNextDueDate(ruleId: string): Promise<RecurringRule> {
  const [existing] = await db
    .select({ nextDueDate: recurringRulesTable.nextDueDate, frequency: recurringRulesTable.frequency })
    .from(recurringRulesTable)
    .where(eq(recurringRulesTable.id, ruleId));

  if (!existing) throw new Error(`Rule not found: ${ruleId}`);

  const d = new Date(existing.nextDueDate);
  switch (existing.frequency) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': {
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
      d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
      break;
    }
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return updateRecurringRule(ruleId, { firstDueDate: d.toISOString().slice(0, 10) });
}

export async function deactivateRule(ruleId: string): Promise<RecurringRule> {
  return updateRecurringRule(ruleId, { isActive: false });
}

// --- Income Records ---

export async function insertIncomeRecord(
  input: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt'>
): Promise<IncomeRecord> {
  const userId = (await getProfile())?.userId ?? LOCAL_USER_ID;
  const id = newId();
  await db.insert(incomeRecordsTable).values({ id, userId, ...input });
  const [row] = await db.select().from(incomeRecordsTable).where(eq(incomeRecordsTable.id, id));
  return { ...row, userId: row.userId };
}

// --- Monthly summaries (DB-04: single 6-month aggregated query) ---

export async function getMonthlyExpenseSummary(
  userId: string,
  month: number,
  year: number
): Promise<MonthlyExpenseSummary> {
  // This function is called per-month by the Insights screen; the real
  // aggregation that collapses 18 calls into 2 lives in getMultiMonthSummary.
  // Here we do a targeted single-month query (2 DB calls: expenses + budget).
  const [spentRow] = await db
    .select({ total: sum(expensesTable.amount) })
    .from(expensesTable)
    .where(and(eq(expensesTable.userId, userId), monthFilter(month, year)));

  const [budgetRow] = await db
    .select({ total: sum(categoriesTable.monthlyBudget) })
    .from(categoriesTable)
    .where(or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId)));

  return {
    month,
    year,
    totalSpent: Number(spentRow?.total ?? 0),
    totalBudget: Number(budgetRow?.total ?? 0),
  };
}

/**
 * DB-04: fetch all N months in 2 queries instead of 6×3 = 18.
 * Pass an array of {month, year} pairs; returns a map keyed by "YYYY-MM".
 */
export async function getMultiMonthSummary(
  userId: string,
  months: Array<{ month: number; year: number }>
): Promise<MonthlyExpenseSummary[]> {
  if (months.length === 0) return [];

  // Build date-range bounds from the months array
  const sorted = [...months].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const startDate = `${first.year}-${String(first.month).padStart(2, '0')}-01`;
  // last day of the last month
  const lastDay = new Date(last.year, last.month, 0).getDate();
  const endDate = `${last.year}-${String(last.month).padStart(2, '0')}-${lastDay}`;

  // Query 1: sum expenses per month in range
  const expenseRows = await db
    .select({
      month: sql<number>`cast(strftime('%m', ${expensesTable.date}) as integer)`,
      year: sql<number>`cast(strftime('%Y', ${expensesTable.date}) as integer)`,
      total: sum(expensesTable.amount),
    })
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        gte(expensesTable.date, startDate),
        lte(expensesTable.date, endDate)
      )
    )
    .groupBy(
      sql`strftime('%Y-%m', ${expensesTable.date})`
    );

  // Query 2: total monthly budget (same for every month — one row)
  const [budgetRow] = await db
    .select({ total: sum(categoriesTable.monthlyBudget) })
    .from(categoriesTable)
    .where(or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId)));

  const totalBudget = Number(budgetRow?.total ?? 0);
  const spentByKey: Record<string, number> = {};
  for (const r of expenseRows) {
    spentByKey[`${r.year}-${String(r.month).padStart(2, '0')}`] = Number(r.total ?? 0);
  }

  return months.map(({ month, year }) => ({
    month,
    year,
    totalSpent: spentByKey[`${year}-${String(month).padStart(2, '0')}`] ?? 0,
    totalBudget,
  }));
}

// --- Sync queue ---

export async function enqueue(
  operation: 'insert' | 'update' | 'delete',
  table: string,
  payload: unknown
): Promise<void> {
  // recordId extracted from payload when available; fall back to empty string
  const recordId = (payload as Record<string, unknown>)?.id as string ?? '';
  await db.insert(syncQueueTable).values({
    operation,
    tableName: table,
    recordId,
    payload: JSON.stringify(payload),
  });
}

export async function getPendingSyncQueue() {
  return db.select().from(syncQueueTable).orderBy(syncQueueTable.createdAt);
}

/** Call after each entry is successfully synced to remove it and prevent duplicate sends. */
export async function flushSyncQueueEntry(id: number): Promise<void> {
  await db.delete(syncQueueTable).where(eq(syncQueueTable.id, id));
}
