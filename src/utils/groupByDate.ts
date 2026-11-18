import { ExpenseRow } from '../db/expenses';

export function groupByDate(expenses: ExpenseRow[]): Array<{ date: string; expenses: ExpenseRow[] }> {
  if (expenses.length === 0) return [];
  const groups: Array<{ date: string; expenses: ExpenseRow[] }> = [];
  let currentGroup: { date: string; expenses: ExpenseRow[] } | null = null;
  for (const expense of expenses) {
    if (currentGroup === null || expense.date !== currentGroup.date) {
      currentGroup = { date: expense.date, expenses: [expense] };
      groups.push(currentGroup);
    } else {
      currentGroup.expenses.push(expense);
    }
  }
  return groups;
}
