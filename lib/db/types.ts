// Shared DB types consumed by both stubs and real implementations.
// Screen components import from lib/db/index.ts — not from stubs directly.

export type IncomeMode = 'salary' | 'mixed' | 'target';
export type PaymentMethod = 'Cash' | 'GCash' | 'Card' | 'Others';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Profile {
  id: string;
  userId: string;
  incomeMode: IncomeMode;
  monthlySalary: number | null;
  savingsTarget: number | null;
  budgetCycleStart: number; // 1–28
  expoPushToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;        // emoji or icon name
  color: string;       // hex color string
  monthlyBudget: number; // 0 = no limit
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  merchant: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
  date: string;        // ISO date string
  isRecurring: boolean;
  recurringRuleId: string | null;
  syncedAt: string | null;
  createdAt: string;
}

export interface RecurringRule {
  id: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  frequency: Frequency;
  nextDueDate: string;  // ISO date string
  isActive: boolean;
  paymentMethod: PaymentMethod;
}

export interface IncomeRecord {
  id: string;
  userId: string;
  amount: number;
  source: string;
  month: number;
  year: number;
  createdAt: string;
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  monthlyBudget: number;
  spent: number;
  percent: number; // spent / monthlyBudget * 100; Infinity if budget = 0
}

export interface SavingsGap {
  expectedSavings: number;
  actualSavings: number;
  gap: number;          // positive = ahead, negative = behind
  totalIncome: number;
  totalExpenses: number;
  incomeMode: IncomeMode;
}

export interface MonthlyExpenseSummary {
  month: number;
  year: number;
  totalSpent: number;
  totalBudget: number;
}

// Mutation input types
export interface InsertExpenseInput {
  amount: number;
  categoryId: string;
  merchant?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  date: string;
  isRecurring?: boolean;
  recurringRuleId?: string;
}

export interface InsertRecurringRuleInput {
  name: string;
  amount: number;
  categoryId: string;
  frequency: Frequency;
  firstDueDate: string;
  paymentMethod: PaymentMethod;
}

export interface InsertProfileInput {
  incomeMode: IncomeMode;
  monthlySalary?: number;
  savingsTarget?: number;
  budgetCycleStart?: number;
}
