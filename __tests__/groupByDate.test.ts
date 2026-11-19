import { groupByDate } from '../src/utils/groupByDate';
import { ExpenseRow } from '../src/db/expenses';

function makeExpense(id: string, date: string): ExpenseRow {
  return {
    id,
    amount: 100,
    category_id: null,
    merchant: null,
    notes: null,
    payment_method: 'cash',
    date,
    deleted_at: null,
    created_at: '2024-06-15T00:00:00.000Z',
    updated_at: '2024-06-15T00:00:00.000Z',
  };
}

describe('groupByDate', () => {
  it('returns empty array for empty input', () => {
    expect(groupByDate([])).toEqual([]);
  });

  it('groups expenses with the same date into one section', () => {
    const expenses = [makeExpense('a', '2024-06-15'), makeExpense('b', '2024-06-15')];
    const result = groupByDate(expenses);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2024-06-15');
    expect(result[0].expenses).toHaveLength(2);
  });

  it('produces one section per distinct date, preserving input order', () => {
    const expenses = [
      makeExpense('a', '2024-06-15'),
      makeExpense('b', '2024-06-14'),
      makeExpense('c', '2024-06-14'),
      makeExpense('d', '2024-06-13'),
    ];
    const result = groupByDate(expenses);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: '2024-06-15', expenses: [expenses[0]] });
    expect(result[1]).toEqual({ date: '2024-06-14', expenses: [expenses[1], expenses[2]] });
    expect(result[2]).toEqual({ date: '2024-06-13', expenses: [expenses[3]] });
  });
});
