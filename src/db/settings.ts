import { DbDriver } from './driver';

export type IncomeMode = 'salary' | 'mixed' | 'target';

export interface AppSettings {
  incomeMode: IncomeMode;
  monthlySalary: number;
  freelanceIncome: number;
  expectedSavings: number;
  savingsTarget: number;
  budgetCycleDay: number;
}

const DEFAULTS: AppSettings = {
  incomeMode: 'salary',
  monthlySalary: 0,
  freelanceIncome: 0,
  expectedSavings: 0,
  savingsTarget: 0,
  budgetCycleDay: 1,
};

function get(db: DbDriver, key: string): string | undefined {
  return db.queryOne<{ value: string }>(`SELECT value FROM settings WHERE key = ?`, [key])?.value;
}

function set(db: DbDriver, key: string, value: string): void {
  db.execute(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
}

export function loadSettings(db: DbDriver): AppSettings {
  return {
    incomeMode: (get(db, 'incomeMode') as IncomeMode | undefined) ?? DEFAULTS.incomeMode,
    monthlySalary: Number(get(db, 'monthlySalary') ?? DEFAULTS.monthlySalary),
    freelanceIncome: Number(get(db, 'freelanceIncome') ?? DEFAULTS.freelanceIncome),
    expectedSavings: Number(get(db, 'expectedSavings') ?? DEFAULTS.expectedSavings),
    savingsTarget: Number(get(db, 'savingsTarget') ?? DEFAULTS.savingsTarget),
    budgetCycleDay: Number(get(db, 'budgetCycleDay') ?? DEFAULTS.budgetCycleDay),
  };
}

export function saveSettings(db: DbDriver, s: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(s)) {
    set(db, key, String(value));
  }
}

export function hasCompletedOnboarding(db: DbDriver): boolean {
  return get(db, 'onboardingDone') === '1';
}

export function markOnboardingDone(db: DbDriver): void {
  set(db, 'onboardingDone', '1');
}
