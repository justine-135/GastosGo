import { computeGap } from '../src/utils/computeGap';

const base = { monthlySalary: 0, freelanceIncome: 0, expectedSavings: 0, savingsTarget: 0, totalExpenses: 0 };

describe('computeGap', () => {
  it('salary mode: positive gap = on track', () => {
    const r = computeGap({ ...base, incomeMode: 'salary', monthlySalary: 50000, expectedSavings: 10000, totalExpenses: 30000 });
    expect(r.gap).toBe(10000);
    expect(r.onTrack).toBe(true);
  });

  it('salary mode: negative gap = at risk', () => {
    const r = computeGap({ ...base, incomeMode: 'salary', monthlySalary: 30000, expectedSavings: 10000, totalExpenses: 25000 });
    expect(r.gap).toBe(-5000);
    expect(r.onTrack).toBe(false);
  });

  it('mixed mode: sums salary + freelance', () => {
    const r = computeGap({ ...base, incomeMode: 'mixed', monthlySalary: 40000, freelanceIncome: 10000, expectedSavings: 15000, totalExpenses: 20000 });
    expect(r.actualSavings).toBe(30000);
    expect(r.gap).toBe(15000);
    expect(r.onTrack).toBe(true);
  });

  it('target mode: expectedSavings is 0, actual = target - expenses', () => {
    const r = computeGap({ ...base, incomeMode: 'target', savingsTarget: 20000, totalExpenses: 15000 });
    expect(r.actualSavings).toBe(5000);
    expect(r.expectedSavings).toBe(0);
    expect(r.gap).toBe(5000);
    expect(r.onTrack).toBe(true);
  });

  it('target mode: overspent savings target', () => {
    const r = computeGap({ ...base, incomeMode: 'target', savingsTarget: 10000, totalExpenses: 12000 });
    expect(r.gap).toBe(-2000);
    expect(r.onTrack).toBe(false);
  });

  it('zero income salary mode', () => {
    const r = computeGap({ ...base, incomeMode: 'salary', totalExpenses: 5000 });
    expect(r.gap).toBe(-5000);
    expect(r.onTrack).toBe(false);
  });

  it('gap exactly zero = on track', () => {
    const r = computeGap({ ...base, incomeMode: 'salary', monthlySalary: 20000, expectedSavings: 5000, totalExpenses: 15000 });
    expect(r.gap).toBe(0);
    expect(r.onTrack).toBe(true);
  });
});
