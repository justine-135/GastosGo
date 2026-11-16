import { computeSavingsGap } from "./savingsGap";

describe("computeSavingsGap", () => {
  it("salary mode: gap = salary − expenses − savingsTarget", () => {
    const r = computeSavingsGap({ incomeMode: "salary", salaryAmount: 25000, savingsTarget: 5000, totalExpenses: 10000, incomeRecordsTotal: 0 });
    expect(r.actualSavings).toBe(15000); // 25000 − 10000
    expect(r.gap).toBe(10000);           // 15000 − 5000
  });

  it("mixed mode: uses incomeRecordsTotal not salary", () => {
    const r = computeSavingsGap({ incomeMode: "mixed", salaryAmount: 0, savingsTarget: 5000, totalExpenses: 8000, incomeRecordsTotal: 20000 });
    expect(r.incomeTotal).toBe(20000);
    expect(r.gap).toBe(7000); // (20000−8000) − 5000
  });

  it("target mode: gap = savingsTarget − totalExpenses (ADR-0001)", () => {
    const r = computeSavingsGap({ incomeMode: "target", salaryAmount: 0, savingsTarget: 8000, totalExpenses: 3000, incomeRecordsTotal: 0 });
    expect(r.gap).toBe(5000);  // positive = under cap
    expect(r.incomeTotal).toBeNull();
  });

  it("target mode: negative gap when over cap", () => {
    const r = computeSavingsGap({ incomeMode: "target", salaryAmount: 0, savingsTarget: 8000, totalExpenses: 9000, incomeRecordsTotal: 0 });
    expect(r.gap).toBe(-1000);
  });
});
