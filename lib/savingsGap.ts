// ADR-0001: gap = actualSavings − expectedSavings; positive = on track
export type IncomeMode = "salary" | "mixed" | "target";

export interface GapInput {
  incomeMode: IncomeMode;
  salaryAmount: number;
  savingsTarget: number;
  totalExpenses: number;
  incomeRecordsTotal: number;
}

export interface GapResult {
  gap: number;
  actualSavings: number;
  expectedSavings: number;
  incomeTotal: number | null;
  totalExpenses: number;
}

export function computeSavingsGap(input: GapInput): GapResult {
  const { incomeMode, salaryAmount, savingsTarget, totalExpenses, incomeRecordsTotal } = input;
  let actualSavings = 0;
  let expectedSavings = 0;
  let incomeTotal: number | null = null;

  if (incomeMode === "salary") {
    incomeTotal = salaryAmount;
    actualSavings = salaryAmount - totalExpenses;
    expectedSavings = savingsTarget;
  } else if (incomeMode === "mixed") {
    incomeTotal = incomeRecordsTotal;
    actualSavings = incomeTotal - totalExpenses;
    expectedSavings = savingsTarget;
  } else {
    // target: actualSavings = savingsTarget − totalExpenses; expectedSavings = 0
    actualSavings = savingsTarget - totalExpenses;
    expectedSavings = 0;
  }

  return {
    gap: actualSavings - expectedSavings,
    actualSavings,
    expectedSavings,
    incomeTotal,
    totalExpenses,
  };
}
