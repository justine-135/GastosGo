import { CategoryRow } from '../db/categories';
import { ExpenseRow } from '../db/expenses';

export interface CategoryBudgetStatus {
  categoryId: string;
  spent: number;
  limit: number;
}

function localDateStr(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function budgetCycleStartStr(cycleStartDay: number, referenceDate: Date): string {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const refDateStr = localDateStr(year, month, referenceDate.getDate());
  const startThisMonthStr = localDateStr(year, month, cycleStartDay);
  if (refDateStr >= startThisMonthStr) {
    return startThisMonthStr;
  }
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  return localDateStr(prevYear, prevMonth, cycleStartDay);
}

export function spendingCap(categories: CategoryRow[]): number {
  return categories.reduce((sum, category) => sum + (category.monthly_budget > 0 ? category.monthly_budget : 0), 0);
}

export function budgetedSpent(
  expenses: ExpenseRow[],
  categories: CategoryRow[],
  cycleStartDay: number = 1,
  referenceDate: Date = new Date(),
): CategoryBudgetStatus[] {
  const budgetedCategories = categories.filter(category => category.monthly_budget > 0);
  const cycleStartStr = budgetCycleStartStr(cycleStartDay, referenceDate);

  return budgetedCategories.map(category => {
    const spent = expenses
      .filter(expense => expense.category_id === category.id && expense.date >= cycleStartStr)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { categoryId: category.id, spent, limit: category.monthly_budget };
  });
}

export function remainingSpendable(
  categories: CategoryRow[],
  expenses: ExpenseRow[],
  cycleStartDay: number = 1,
  referenceDate: Date = new Date(),
): number {
  const cap = spendingCap(categories);
  const statuses = budgetedSpent(expenses, categories, cycleStartDay, referenceDate);
  const totalSpentInBudgeted = statuses.reduce((sum, status) => sum + status.spent, 0);
  return cap - totalSpentInBudgeted;
}
