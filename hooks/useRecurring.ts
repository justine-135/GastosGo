import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecurringRules,
  getRulesDueWithin,
  insertRecurringRule,
  updateRecurringRule,
  advanceNextDueDate,
  deactivateRule,
  insertExpense,
  enqueue,
} from '../lib/db';
import type { InsertRecurringRuleInput, PaymentMethod } from '../lib/db/types';
import { LOCAL_USER_ID } from '../lib/constants';

const USER_ID = LOCAL_USER_ID;

export const recurringKeys = {
  all: ['recurring', USER_ID] as const,
  dueSoon: (days: number) => ['recurring', USER_ID, 'due', days] as const,
};

export function useRecurringRules() {
  return useQuery({
    queryKey: recurringKeys.all,
    queryFn: () => getRecurringRules(USER_ID),
    staleTime: 30_000,
  });
}

export function useRulesDueSoon(days = 7) {
  return useQuery({
    queryKey: recurringKeys.dueSoon(days),
    queryFn: () => getRulesDueWithin(USER_ID, days),
    staleTime: 30_000,
  });
}

export function useAddRecurringRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InsertRecurringRuleInput) => insertRecurringRule(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function useUpdateRecurringRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<InsertRecurringRuleInput & { isActive: boolean }> }) =>
      updateRecurringRule(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function useMarkRuleAsPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ruleId, categoryId, amount, paymentMethod }: {
      ruleId: string;
      categoryId: string;
      amount: number;
      paymentMethod: PaymentMethod;
    }) => {
      const [rule, expense] = await Promise.all([
        advanceNextDueDate(ruleId),
        insertExpense({
          amount,
          categoryId,
          paymentMethod,
          date: (() => { const now = new Date(); const pad = (n: number) => String(n).padStart(2, '0'); return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; })(),
          isRecurring: true,
          recurringRuleId: ruleId,
        }),
      ]);
      await Promise.all([
        enqueue('update', 'recurring_rules', rule),
        enqueue('insert', 'expenses', expense),
      ]);
      return { rule, expense };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeactivateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => deactivateRule(ruleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}
