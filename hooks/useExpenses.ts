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

const USER_ID = 'stub-user-001'; // replaced when auth is wired

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
    staleTime: 30_000,
  });
}

export function useRecentExpenses(limit = 5) {
  return useQuery({
    queryKey: recentExpensesKey(),
    queryFn: () => getRecentExpenses(USER_ID, limit),
    staleTime: 30_000,
  });
}

export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InsertExpenseInput) => insertExpense(input),
    onSuccess: async (_, input) => {
      const d = new Date(input.date);
      await qc.invalidateQueries({ queryKey: expenseKeys(d.getMonth() + 1, d.getFullYear()) });
      await qc.invalidateQueries({ queryKey: recentExpensesKey() });
      await qc.invalidateQueries({ queryKey: ['budgets'] });
      await qc.invalidateQueries({ queryKey: ['savings'] });
      await enqueue('insert', 'expenses', input);
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<InsertExpenseInput> }) =>
      updateExpense(id, input),
    onSuccess: async (expense) => {
      const d = new Date(expense.date);
      await qc.invalidateQueries({ queryKey: expenseKeys(d.getMonth() + 1, d.getFullYear()) });
      await qc.invalidateQueries({ queryKey: recentExpensesKey() });
      await qc.invalidateQueries({ queryKey: ['budgets'] });
      await enqueue('update', 'expenses', expense);
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => deleteExpense(id),
    onSuccess: async (_, { id, date }) => {
      const d = new Date(date);
      await qc.invalidateQueries({ queryKey: expenseKeys(d.getMonth() + 1, d.getFullYear()) });
      await qc.invalidateQueries({ queryKey: recentExpensesKey() });
      await qc.invalidateQueries({ queryKey: ['budgets'] });
      await enqueue('delete', 'expenses', { id });
    },
  });
}
