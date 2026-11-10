import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpensesByMonth,
  getRecentExpenses,
  insertExpense,
  updateExpense,
  deleteExpense,
  enqueue,
} from '../lib/db';
import type { InsertExpenseInput } from '../lib/db/types';
import { LOCAL_USER_ID } from '../lib/constants';

const USER_ID = LOCAL_USER_ID;

export function expenseKeys(month: number, year: number) {
  return ['expenses', USER_ID, month, year] as const;
}

export function recentExpensesKey() {
  return ['expenses', USER_ID, 'recent'] as const;
}

export function useExpenses(month: number, year: number) {
  return useQuery({
    queryKey: expenseKeys(month, year),
    queryFn: () => getExpensesByMonth(USER_ID, month, year),
  });
}

export function useRecentExpenses(limit = 5) {
  return useQuery({
    queryKey: recentExpensesKey(),
    queryFn: () => getRecentExpenses(USER_ID, limit),
  });
}

export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InsertExpenseInput) => insertExpense(input),
    onSuccess: async (_, input) => {
      const d = new Date(input.date);
      await enqueue('insert', 'expenses', input);
      await qc.invalidateQueries({ queryKey: expenseKeys(d.getMonth() + 1, d.getFullYear()) });
      await qc.invalidateQueries({ queryKey: recentExpensesKey() });
      await qc.invalidateQueries({ queryKey: ['budgets'] });
      await qc.invalidateQueries({ queryKey: ['savings'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<InsertExpenseInput>; oldDate?: string }) =>
      updateExpense(id, input),
    onSuccess: async (expense, { oldDate }) => {
      const d = new Date(expense.date);
      await enqueue('update', 'expenses', expense);
      await qc.invalidateQueries({ queryKey: expenseKeys(d.getMonth() + 1, d.getFullYear()) });
      // invalidate old month too if the date changed
      if (oldDate && oldDate !== expense.date) {
        const od = new Date(oldDate);
        await qc.invalidateQueries({ queryKey: expenseKeys(od.getMonth() + 1, od.getFullYear()) });
      }
      await qc.invalidateQueries({ queryKey: recentExpensesKey() });
      await qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => deleteExpense(id), // date not needed by mutationFn; used in onSuccess for targeted invalidation
    onSuccess: async (_, { id, date }) => {
      const d = new Date(date);
      await qc.invalidateQueries({ queryKey: expenseKeys(d.getMonth() + 1, d.getFullYear()) });
      await qc.invalidateQueries({ queryKey: recentExpensesKey() });
      await qc.invalidateQueries({ queryKey: ['budgets'] });
      await enqueue('delete', 'expenses', { id });
    },
  });
}
