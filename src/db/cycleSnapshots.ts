import { DbDriver } from './driver';
import { IncomeMode } from './settings';
import { generateId } from '../utils/generateId';

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

export function insertCycleSnapshot(db: DbDriver, input: InsertCycleSnapshotInput): void {
  db.execute(
    `INSERT INTO cycle_snapshots (id, cycle_start_date, income_mode, monthly_salary, freelance_income, expected_savings, savings_target)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [generateId(), input.cycleStartDate, input.incomeMode, input.monthlySalary, input.freelanceIncome, input.expectedSavings, input.savingsTarget],
  );
}

export function getLatestCycleSnapshot(db: DbDriver): CycleSnapshot | undefined {
  return db.queryOne<CycleSnapshot>(
    `SELECT * FROM cycle_snapshots ORDER BY cycle_start_date DESC LIMIT 1`,
  );
}
