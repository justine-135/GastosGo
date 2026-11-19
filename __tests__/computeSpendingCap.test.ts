import { spendingCap, budgetedSpent, remainingSpendable } from '../src/utils/computeSpendingCap';
import { CategoryRow } from '../src/db/categories';
import { ExpenseRow } from '../src/db/expenses';

function makeCategory(id: string, monthly_budget: number, carryover_enabled = 0): CategoryRow {
  return {
    id,
    name: id,
    icon: '📦',
    color: '#000',
    monthly_budget,
    carryover_enabled,
    deleted_at: null,
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-01-01T00:00:00',
  };
}

function makeExpense(id: string, amount: number, category_id: string | null, date: string): ExpenseRow {
  return {
    id,
    amount,
    category_id,
    merchant: null,
    notes: null,
    payment_method: 'Cash',
    date,
    deleted_at: null,
    created_at: date + 'T00:00:00',
    updated_at: date + 'T00:00:00',
  };
}

describe('spendingCap', () => {
  it('sums only categories with a monthly_budget > 0', () => {
    const categories = [makeCategory('a', 5000), makeCategory('b', 3000), makeCategory('c', 0)];
    expect(spendingCap(categories)).toBe(8000);
  });

  it('returns 0 when no categories are budgeted', () => {
    const categories = [makeCategory('a', 0), makeCategory('b', 0)];
    expect(spendingCap(categories)).toBe(0);
  });

  it('returns 0 for empty category list', () => {
    expect(spendingCap([])).toBe(0);
  });
});

describe('budgetedSpent', () => {
  const referenceDate = new Date(2026, 10, 15);

  it('returns per-category spent vs limit for budgeted categories only', () => {
    const categories = [makeCategory('food', 5000), makeCategory('transport', 3000), makeCategory('misc', 0)];
    const expenses = [
      makeExpense('e1', 1000, 'food', '2026-11-10'),
      makeExpense('e2', 500, 'food', '2026-11-12'),
      makeExpense('e3', 800, 'transport', '2026-11-14'),
      makeExpense('e4', 200, 'misc', '2026-11-14'),
    ];
    const result = budgetedSpent(expenses, categories, 1, referenceDate);
    expect(result).toHaveLength(2);
    const foodStatus = result.find(s => s.categoryId === 'food')!;
    expect(foodStatus.spent).toBe(1500);
    expect(foodStatus.limit).toBe(5000);
    const transportStatus = result.find(s => s.categoryId === 'transport')!;
    expect(transportStatus.spent).toBe(800);
  });

  it('excludes expenses before the cycle start day', () => {
    const categories = [makeCategory('food', 5000)];
    const expenses = [
      makeExpense('e1', 1000, 'food', '2026-10-25'),
      makeExpense('e2', 2000, 'food', '2026-11-01'),
    ];
    const result = budgetedSpent(expenses, categories, 1, referenceDate);
    expect(result[0].spent).toBe(2000);
  });

  it('handles cycle start mid-month: cycle started Oct 20 when reference is Nov 18 and day is 20', () => {
    const categories = [makeCategory('food', 5000)];
    const expenses = [
      makeExpense('e1', 1000, 'food', '2026-11-10'),
      makeExpense('e2', 2000, 'food', '2026-11-20'),
      makeExpense('e3', 500,  'food', '2026-10-19'),
    ];
    const earlyRef = new Date(2026, 10, 18);
    const result = budgetedSpent(expenses, categories, 20, earlyRef);
    expect(result[0].spent).toBe(3000);
  });

  it('returns 0 spent when no expenses in cycle', () => {
    const categories = [makeCategory('food', 5000)];
    const result = budgetedSpent([], categories, 1, referenceDate);
    expect(result[0].spent).toBe(0);
  });

  it('returns empty array when no budgeted categories', () => {
    const categories = [makeCategory('misc', 0)];
    const result = budgetedSpent([], categories, 1, referenceDate);
    expect(result).toHaveLength(0);
  });
});

describe('remainingSpendable', () => {
  const referenceDate = new Date(2026, 10, 15);

  it('returns spending cap minus total spent in budgeted categories', () => {
    const categories = [makeCategory('food', 5000), makeCategory('transport', 3000)];
    const expenses = [makeExpense('e1', 2000, 'food', '2026-11-10')];
    expect(remainingSpendable(categories, expenses, 1, referenceDate)).toBe(6000);
  });

  it('returns 0 when no budgeted categories', () => {
    const categories = [makeCategory('misc', 0)];
    expect(remainingSpendable(categories, [], 1, referenceDate)).toBe(0);
  });

  it('goes negative when over-budget', () => {
    const categories = [makeCategory('food', 1000)];
    const expenses = [makeExpense('e1', 1500, 'food', '2026-11-10')];
    expect(remainingSpendable(categories, expenses, 1, referenceDate)).toBe(-500);
  });
});
