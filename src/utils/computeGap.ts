import { IncomeMode } from '../db/settings';

export interface GapInput {
  incomeMode: IncomeMode;
  monthlySalary: number;
  freelanceIncome: number;
  expectedSavings: number;
  savingsTarget: number;
  totalExpenses: number;
}

export interface GapResult {
  actualSavings: number;
  expectedSavings: number;
  gap: number;
  onTrack: boolean;
}

export function computeGap(input: GapInput): GapResult {
  let actualSavings: number;
  let expectedSavings: number;

  if (input.incomeMode === 'salary') {
    actualSavings = input.monthlySalary - input.totalExpenses;
    expectedSavings = input.expectedSavings;
  } else if (input.incomeMode === 'mixed') {
    actualSavings = input.monthlySalary + input.freelanceIncome - input.totalExpenses;
    expectedSavings = input.expectedSavings;
  } else {
    actualSavings = input.savingsTarget - input.totalExpenses;
    expectedSavings = 0;
  }

  const gap = actualSavings - expectedSavings;
  return { actualSavings, expectedSavings, gap, onTrack: gap >= 0 };
}
