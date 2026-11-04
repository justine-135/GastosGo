import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgetProgress, updateCategory } from '../lib/db';

const USER_ID = 'stub-user-001';

export function budgetKeys(month: number, year: number) {
  return ['budgets', USER_ID, month, year] as const;
}

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: budgetKeys(month, year),
    queryFn: () => getBudgetProgress(USER_ID, month, year),
    staleTime: 30_000,
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, monthlyBudget }: { categoryId: string; monthlyBudget: number }) =>
      updateCategory(categoryId, { monthlyBudget }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
