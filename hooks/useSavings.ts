import { useQuery } from '@tanstack/react-query';
import { getSavingsGap } from '../lib/db';
import { LOCAL_USER_ID } from '../lib/constants';

const USER_ID = LOCAL_USER_ID;

export function savingsKeys(month: number, year: number) {
  return ['savings', USER_ID, month, year] as const;
}

export function useSavings(month: number, year: number) {
  return useQuery({
    queryKey: savingsKeys(month, year),
    queryFn: () => getSavingsGap(USER_ID, month, year),
    staleTime: 30_000,
  });
}
