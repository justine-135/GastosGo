// DB STUBS — realistic mock data for all DB helpers.
// Real implementations (drizzle + expo-sqlite) replace these without changing call sites.
// Import from lib/db/index.ts, not from here directly.

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

const USER_ID = 'stub-user-001';

// --- Seed data ---

const STUB_CATEGORIES: Category[] = [
  { id: 'cat-1', userId: USER_ID, name: 'Food', icon: '🍚', color: '#F4A261', monthlyBudget: 3000 },
  { id: 'cat-2', userId: USER_ID, name: 'Transport', icon: '🚌', color: '#A8DADC', monthlyBudget: 1500 },
  { id: 'cat-3', userId: USER_ID, name: 'Leisure', icon: '🎮', color: '#E9C46A', monthlyBudget: 1000 },
  { id: 'cat-4', userId: USER_ID, name: 'Bills', icon: '💡', color: '#81B29A', monthlyBudget: 2000 },
  { id: 'cat-5', userId: USER_ID, name: 'Shopping', icon: '🛍️', color: '#E76F51', monthlyBudget: 2000 },
  { id: 'cat-6', userId: USER_ID, name: 'Health', icon: '💊', color: '#457B9D', monthlyBudget: 500 },
  { id: 'cat-7', userId: USER_ID, name: 'Other', icon: '📌', color: '#264653', monthlyBudget: 0 },
];

const today = new Date();
const isoToday = today.toISOString().split('T')[0];
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const isoYesterday = yesterday.toISOString().split('T')[0];

const STUB_EXPENSES: Expense[] = [
  {
    id: 'exp-1', userId: USER_ID, amount: 129.75, categoryId: 'cat-1',
    categoryName: 'Food', categoryColor: '#F4A261', merchant: 'Jollibee',
    notes: null, paymentMethod: 'GCash', date: isoToday,
    isRecurring: false, recurringRuleId: null, syncedAt: null, createdAt: isoToday,
  },
  {
    id: 'exp-2', userId: USER_ID, amount: 25, categoryId: 'cat-2',
    categoryName: 'Transport', categoryColor: '#A8DADC', merchant: 'MRT',
    notes: null, paymentMethod: 'Cash', date: isoToday,
    isRecurring: false, recurringRuleId: null, syncedAt: null, createdAt: isoToday,
  },
  {
    id: 'exp-3', userId: USER_ID, amount: 499, categoryId: 'cat-3',
    categoryName: 'Leisure', categoryColor: '#E9C46A', merchant: 'Netflix',
    notes: 'Monthly sub', paymentMethod: 'Card', date: isoYesterday,
    isRecurring: true, recurringRuleId: 'rec-1', syncedAt: null, createdAt: isoYesterday,
  },
  {
    id: 'exp-4', userId: USER_ID, amount: 350, categoryId: 'cat-1',
    categoryName: 'Food', categoryColor: '#F4A261', merchant: 'Grab Food',
    notes: null, paymentMethod: 'GCash', date: isoYesterday,
    isRecurring: false, recurringRuleId: null, syncedAt: null, createdAt: isoYesterday,
  },
  {
    id: 'exp-5', userId: USER_ID, amount: 1200, categoryId: 'cat-4',
    categoryName: 'Bills', categoryColor: '#81B29A', merchant: 'Meralco',
    notes: null, paymentMethod: 'GCash', date: isoYesterday,
    isRecurring: true, recurringRuleId: 'rec-2', syncedAt: null, createdAt: isoYesterday,
  },
];

const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 3);

const STUB_RECURRING: RecurringRule[] = [
  {
    id: 'rec-1', userId: USER_ID, name: 'Netflix', amount: 499,
    categoryId: 'cat-3', categoryName: 'Leisure', categoryColor: '#E9C46A',
    frequency: 'monthly', nextDueDate: nextWeek.toISOString().split('T')[0],
    isActive: true, paymentMethod: 'Card',
  },
  {
    id: 'rec-2', userId: USER_ID, name: 'Electric Bill', amount: 1200,
    categoryId: 'cat-4', categoryName: 'Bills', categoryColor: '#81B29A',
    frequency: 'monthly', nextDueDate: nextWeek.toISOString().split('T')[0],
    isActive: true, paymentMethod: 'GCash',
  },
  {
    id: 'rec-3', userId: USER_ID, name: 'Internet', amount: 1299,
    categoryId: 'cat-4', categoryName: 'Bills', categoryColor: '#81B29A',
    frequency: 'monthly',
    nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5).toISOString().split('T')[0],
    isActive: false, paymentMethod: 'Card',
  },
];

const STUB_PROFILE: Profile = {
  id: 'profile-1',
  userId: USER_ID,
  incomeMode: 'salary',
  monthlySalary: 25000,
  savingsTarget: 5000,
  budgetCycleStart: 1,
  expoPushToken: null,
  createdAt: isoToday,
  updatedAt: isoToday,
};

// --- Helpers ---

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// --- Profile ---

export async function getProfile(): Promise<Profile | null> {
  return delay(STUB_PROFILE);
}

export async function insertProfile(input: InsertProfileInput): Promise<Profile> {
  return delay({ ...STUB_PROFILE, ...input });
}

export async function updateProfile(input: Partial<InsertProfileInput>): Promise<Profile> {
  return delay({ ...STUB_PROFILE, ...input, updatedAt: new Date().toISOString() });
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  return delay(STUB_CATEGORIES);
}

export async function updateCategory(id: string, patch: Partial<Pick<Category, 'name' | 'color' | 'icon' | 'monthlyBudget'>>): Promise<Category> {
  const cat = STUB_CATEGORIES.find((c) => c.id === id) ?? STUB_CATEGORIES[0];
  return delay({ ...cat, ...patch });
}

export async function insertCategory(input: Omit<Category, 'id' | 'userId'>): Promise<Category> {
  return delay({ id: `cat-${Date.now()}`, userId: USER_ID, ...input });
}

// --- Expenses ---

export async function getExpensesByMonth(userId: string, month: number, year: number): Promise<Expense[]> {
  return delay(
    STUB_EXPENSES.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    })
  );
}

export async function getRecentExpenses(userId: string, limit: number): Promise<Expense[]> {
  return delay(STUB_EXPENSES.slice(0, limit));
}

export async function insertExpense(input: InsertExpenseInput): Promise<Expense> {
  const cat = STUB_CATEGORIES.find((c) => c.id === input.categoryId) ?? STUB_CATEGORIES[0];
  return delay({
    id: `exp-${Date.now()}`,
    userId: USER_ID,
    amount: input.amount,
    categoryId: input.categoryId,
    categoryName: cat.name,
    categoryColor: cat.color,
    merchant: input.merchant ?? null,
    notes: input.notes ?? null,
    paymentMethod: input.paymentMethod,
    date: input.date,
    isRecurring: input.isRecurring ?? false,
    recurringRuleId: input.recurringRuleId ?? null,
    syncedAt: null,
    createdAt: new Date().toISOString(),
  });
}

export async function updateExpense(id: string, input: Partial<InsertExpenseInput>): Promise<Expense> {
  const existing = STUB_EXPENSES.find((e) => e.id === id) ?? STUB_EXPENSES[0];
  return delay({ ...existing, ...input });
}

export async function deleteExpense(id: string): Promise<void> {
  return delay(undefined);
}

// --- Budget Progress (DB-09) ---

export async function getBudgetProgress(userId: string, month: number, year: number): Promise<BudgetProgress[]> {
  const expenses = await getExpensesByMonth(userId, month, year);
  const spentMap: Record<string, number> = {};
  for (const e of expenses) spentMap[e.categoryId] = (spentMap[e.categoryId] ?? 0) + e.amount;

  return delay(
    STUB_CATEGORIES.map((cat) => {
      const spent = spentMap[cat.id] ?? 0;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        categoryIcon: cat.icon,
        monthlyBudget: cat.monthlyBudget,
        spent,
        percent: cat.monthlyBudget > 0 ? (spent / cat.monthlyBudget) * 100 : 0,
      };
    })
  );
}

// --- Savings Gap (DB-09) ---

export async function getSavingsGap(userId: string, month: number, year: number): Promise<SavingsGap> {
  const expenses = await getExpensesByMonth(userId, month, year);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = STUB_PROFILE.monthlySalary ?? 0;
  const actualSavings = totalIncome - totalExpenses;
  const expectedSavings = STUB_PROFILE.savingsTarget ?? 0;
  return delay({
    expectedSavings,
    actualSavings,
    gap: actualSavings - expectedSavings,
    totalIncome,
    totalExpenses,
    incomeMode: STUB_PROFILE.incomeMode,
  });
}

// --- Recurring Rules (DB-10) ---

export async function getRecurringRules(userId: string): Promise<RecurringRule[]> {
  return delay(STUB_RECURRING);
}

export async function getRulesDueWithin(userId: string, days: number): Promise<RecurringRule[]> {
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() + days);
  return delay(
    STUB_RECURRING.filter((r) => {
      if (!r.isActive) return false;
      const due = new Date(r.nextDueDate);
      return due <= cutoff;
    })
  );
}

export async function insertRecurringRule(input: InsertRecurringRuleInput): Promise<RecurringRule> {
  const cat = STUB_CATEGORIES.find((c) => c.id === input.categoryId) ?? STUB_CATEGORIES[0];
  return delay({
    id: `rec-${Date.now()}`,
    userId: USER_ID,
    name: input.name,
    amount: input.amount,
    categoryId: input.categoryId,
    categoryName: cat.name,
    categoryColor: cat.color,
    frequency: input.frequency,
    nextDueDate: input.firstDueDate,
    isActive: true,
    paymentMethod: input.paymentMethod,
  });
}

export async function updateRecurringRule(id: string, input: Partial<InsertRecurringRuleInput & { isActive: boolean }>): Promise<RecurringRule> {
  const existing = STUB_RECURRING.find((r) => r.id === id) ?? STUB_RECURRING[0];
  return delay({ ...existing, ...input });
}

export async function advanceNextDueDate(ruleId: string): Promise<RecurringRule> {
  const rule = STUB_RECURRING.find((r) => r.id === ruleId) ?? STUB_RECURRING[0];
  const next = new Date(rule.nextDueDate);
  if (rule.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  else if (rule.frequency === 'weekly') next.setDate(next.getDate() + 7);
  else if (rule.frequency === 'daily') next.setDate(next.getDate() + 1);
  else if (rule.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
  return delay({ ...rule, nextDueDate: next.toISOString().split('T')[0] });
}

export async function deactivateRule(ruleId: string): Promise<RecurringRule> {
  const rule = STUB_RECURRING.find((r) => r.id === ruleId) ?? STUB_RECURRING[0];
  return delay({ ...rule, isActive: false });
}

// --- Income Records ---

export async function insertIncomeRecord(input: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt'>): Promise<IncomeRecord> {
  return delay({
    id: `income-${Date.now()}`,
    userId: USER_ID,
    ...input,
    createdAt: new Date().toISOString(),
  });
}

// --- Monthly summaries (for 6-month bar chart) ---

export async function getMonthlyExpenseSummary(userId: string, month: number, year: number): Promise<MonthlyExpenseSummary> {
  const expenses = await getExpensesByMonth(userId, month, year);
  const budgets = await getBudgetProgress(userId, month, year);
  return delay({
    month,
    year,
    totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
    totalBudget: budgets.reduce((sum, b) => sum + b.monthlyBudget, 0),
  });
}

// --- Sync queue (DB-11) ---

export async function enqueue(operation: 'insert' | 'update' | 'delete', table: string, payload: unknown): Promise<void> {
  // shortcut: no-op until real sync worker is wired; real impl writes to sync_queue table
  return delay(undefined, 0);
}
