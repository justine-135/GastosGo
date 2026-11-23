import { DbDriver } from './driver';
import { IncomeMode } from './settings';
import { generateId } from '../utils/generateId';
import { listExpenses, softDeleteExpense } from './expenses';

export interface CycleSnapshot {
  id: string;
  cycle_start_date: string;
  income_mode: IncomeMode;
  monthly_salary: number;
  freelance_income: number;
  expected_savings: number;
  savings_target: number;
  created_at: string;
}

export interface InsertCycleSnapshotInput {
  cycleStartDate: string;
  incomeMode: IncomeMode;
  monthlySalary: number;
  freelanceIncome: number;
  expectedSavings: number;
  savingsTarget: number;
}

export interface ResetCurrentCycleInput extends InsertCycleSnapshotInput {
  wipeExpenses: boolean;
}

export function insertCycleSnapshot(db: DbDriver, input: InsertCycleSnapshotInput): void {
  db.execute(
    `INSERT INTO cycle_snapshots (id, cycle_start_date, income_mode, monthly_salary, freelance_income, expected_savings, savings_target)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [generateId(), input.cycleStartDate, input.incomeMode, input.monthlySalary, input.freelanceIncome, input.expectedSavings, input.savingsTarget],
  );
}

export function getLatestCycleSnapshot(db: DbDriver): CycleSnapshot | undefined {
  return db.queryOne<CycleSnapshot>(
    `SELECT * FROM cycle_snapshots ORDER BY cycle_start_date DESC, rowid DESC LIMIT 1`,
  );
}

export function resetCurrentCycle(db: DbDriver, input: ResetCurrentCycleInput): void {
  insertCycleSnapshot(db, {
    cycleStartDate: input.cycleStartDate,
    incomeMode: input.incomeMode,
    monthlySalary: input.monthlySalary,
    freelanceIncome: input.freelanceIncome,
    expectedSavings: input.expectedSavings,
    savingsTarget: input.savingsTarget,
  });
  if (input.wipeExpenses) {
    const currentCycleExpenses = listExpenses(db, input.cycleStartDate);
    for (const expense of currentCycleExpenses) {
      softDeleteExpense(db, expense.id);
    }
  }
}

export function getAllCycleSnapshotsForDate(db: DbDriver, cycleStartDate: string): CycleSnapshot[] {
  return db.query<CycleSnapshot>(
    `SELECT * FROM cycle_snapshots WHERE cycle_start_date = ? ORDER BY created_at ASC`,
    [cycleStartDate],
  );
}
