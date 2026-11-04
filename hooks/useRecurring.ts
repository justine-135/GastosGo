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

const USER_ID = 'stub-user-001';

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
          date: new Date().toISOString().split('T')[0],
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
