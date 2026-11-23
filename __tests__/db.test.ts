import initSqlJs from 'sql.js';
import { makeDriver } from './helpers/makeDriver';
import { DbDriver } from '../src/db/driver';
import { runMigrations } from '../src/db/migrations';
import { insertExpense, listExpenses, softDeleteExpense, listDeletedExpenses, restoreExpense } from '../src/db/expenses';
import { seedDefaultCategories, listCategories } from '../src/db/categories';
import { isFirstLaunch, markLaunched } from '../src/db/firstLaunch';
import { insertCycleSnapshot, getLatestCycleSnapshot, resetCurrentCycle, getAllCycleSnapshotsForDate } from '../src/db/cycleSnapshots';

describe('SQLite query layer', () => {
  let driver: DbDriver;

  beforeEach(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    driver = makeDriver(db);
    runMigrations(driver);
  });

  describe('seedDefaultCategories / listCategories', () => {
    it('seeds 7 default Categories on first call', () => {
      seedDefaultCategories(driver);
      const categories = listCategories(driver);
      expect(categories).toHaveLength(7);
    });

    it('is idempotent: seeding twice still yields 7 Categories', () => {
      seedDefaultCategories(driver);
      seedDefaultCategories(driver);
      const categories = listCategories(driver);
      expect(categories).toHaveLength(7);
    });
  });

  describe('insertExpense / listExpenses', () => {
    it('inserted Expense appears in list with correct fields', () => {
      seedDefaultCategories(driver);
      const categories = listCategories(driver);
      const categoryId = categories[0].id as string;

      const expenseId = insertExpense(driver, {
        amount: 150,
        categoryId,
        paymentMethod: 'Cash',
        date: '2024-06-15',
      });

      const expenses = listExpenses(driver);
      expect(expenses).toHaveLength(1);
      expect(expenses[0].id).toBe(expenseId);
      expect(expenses[0].amount).toBe(150);
      expect(expenses[0].category_id).toBe(categoryId);
      expect(expenses[0].payment_method).toBe('Cash');
      expect(expenses[0].date).toBe('2024-06-15');
    });

    it('listExpenses excludes soft-deleted Expenses', () => {
      seedDefaultCategories(driver);
      const categories = listCategories(driver);
      const categoryId = categories[0].id as string;

      const expenseId = insertExpense(driver, {
        amount: 200,
        categoryId,
        paymentMethod: 'GCash',
        date: '2024-06-14',
      });

      driver.execute(
        `UPDATE expenses SET deleted_at = datetime('now') WHERE id = ?`,
        [expenseId],
      );

      const expenses = listExpenses(driver);
      expect(expenses).toHaveLength(0);
    });

    it('listExpenses returns most recent date first', () => {
      seedDefaultCategories(driver);
      const categories = listCategories(driver);
      const categoryId = categories[0].id as string;

      insertExpense(driver, { amount: 100, categoryId, paymentMethod: 'Cash', date: '2024-06-10' });
      insertExpense(driver, { amount: 200, categoryId, paymentMethod: 'Cash', date: '2024-06-15' });

      const expenses = listExpenses(driver);
      expect(expenses[0].date).toBe('2024-06-15');
      expect(expenses[1].date).toBe('2024-06-10');
    });
  });

  describe('softDeleteExpense / listDeletedExpenses / restoreExpense', () => {
    let categoryId: string;

    beforeEach(() => {
      seedDefaultCategories(driver);
      categoryId = listCategories(driver)[0].id as string;
    });

    it('soft-deleted Expense disappears from listExpenses', () => {
      const expenseId = insertExpense(driver, { amount: 50, categoryId, paymentMethod: 'Cash', date: '2024-07-01' });
      softDeleteExpense(driver, expenseId);
      expect(listExpenses(driver)).toHaveLength(0);
    });

    it('soft-deleted Expense appears in listDeletedExpenses', () => {
      const expenseId = insertExpense(driver, { amount: 75, categoryId, paymentMethod: 'GCash', date: '2024-07-02' });
      softDeleteExpense(driver, expenseId);
      const deleted = listDeletedExpenses(driver);
      expect(deleted).toHaveLength(1);
      expect(deleted[0].id).toBe(expenseId);
    });

    it('listDeletedExpenses excludes rows deleted more than 30 days ago', () => {
      const expenseId = insertExpense(driver, { amount: 100, categoryId, paymentMethod: 'Card', date: '2024-01-01' });
      driver.execute(
        `UPDATE expenses SET deleted_at = datetime('now', '-31 days') WHERE id = ?`,
        [expenseId],
      );
      expect(listDeletedExpenses(driver)).toHaveLength(0);
    });

    it('listDeletedExpenses includes row deleted exactly 30 days ago (boundary)', () => {
      const expenseId = insertExpense(driver, { amount: 60, categoryId, paymentMethod: 'Cash', date: '2024-01-01' });
      driver.execute(
        `UPDATE expenses SET deleted_at = datetime('now', '-30 days') WHERE id = ?`,
        [expenseId],
      );
      expect(listDeletedExpenses(driver)).toHaveLength(1);
    });

    it('restoreExpense returns Expense to listExpenses and removes from listDeletedExpenses', () => {
      const expenseId = insertExpense(driver, { amount: 200, categoryId, paymentMethod: 'Cash', date: '2024-07-03' });
      softDeleteExpense(driver, expenseId);
      restoreExpense(driver, expenseId);
      expect(listExpenses(driver)).toHaveLength(1);
      expect(listDeletedExpenses(driver)).toHaveLength(0);
    });
  });

  describe('insertCycleSnapshot / getLatestCycleSnapshot', () => {
    it('inserted snapshot is returned by getLatestCycleSnapshot', () => {
      insertCycleSnapshot(driver, {
        cycleStartDate: '2024-01-01',
        incomeMode: 'salary',
        monthlySalary: 50000,
        freelanceIncome: 0,
        expectedSavings: 10000,
        savingsTarget: 0,
      });
      const snapshot = getLatestCycleSnapshot(driver);
      expect(snapshot).toBeDefined();
      expect(snapshot!.cycle_start_date).toBe('2024-01-01');
      expect(snapshot!.income_mode).toBe('salary');
      expect(snapshot!.monthly_salary).toBe(50000);
    });

    it('returns undefined when no snapshot exists', () => {
      expect(getLatestCycleSnapshot(driver)).toBeUndefined();
    });

    it('returns the most recent snapshot when multiple exist', () => {
      insertCycleSnapshot(driver, { cycleStartDate: '2024-01-01', incomeMode: 'salary', monthlySalary: 40000, freelanceIncome: 0, expectedSavings: 8000, savingsTarget: 0 });
      insertCycleSnapshot(driver, { cycleStartDate: '2024-02-01', incomeMode: 'salary', monthlySalary: 45000, freelanceIncome: 0, expectedSavings: 9000, savingsTarget: 0 });
      const snapshot = getLatestCycleSnapshot(driver);
      expect(snapshot!.cycle_start_date).toBe('2024-02-01');
    });

    it('returns most recently created row when two rows share the same cycle_start_date', () => {
      insertCycleSnapshot(driver, { cycleStartDate: '2024-01-01', incomeMode: 'salary', monthlySalary: 50000, freelanceIncome: 0, expectedSavings: 10000, savingsTarget: 0 });
      insertCycleSnapshot(driver, { cycleStartDate: '2024-01-01', incomeMode: 'salary', monthlySalary: 60000, freelanceIncome: 0, expectedSavings: 12000, savingsTarget: 0 });
      const snapshot = getLatestCycleSnapshot(driver);
      expect(snapshot!.monthly_salary).toBe(60000);
      expect(snapshot!.expected_savings).toBe(12000);
    });
  });

  describe('resetCurrentCycle', () => {
    let categoryId: string;

    beforeEach(() => {
      seedDefaultCategories(driver);
      categoryId = listCategories(driver)[0].id as string;
      insertCycleSnapshot(driver, { cycleStartDate: '2024-06-01', incomeMode: 'salary', monthlySalary: 50000, freelanceIncome: 0, expectedSavings: 10000, savingsTarget: 0 });
    });

    it('preserves old snapshot row as audit trail', () => {
      resetCurrentCycle(driver, { cycleStartDate: '2024-06-01', incomeMode: 'salary', monthlySalary: 60000, freelanceIncome: 0, expectedSavings: 12000, savingsTarget: 0, wipeExpenses: false });
      const all = getAllCycleSnapshotsForDate(driver, '2024-06-01');
      expect(all).toHaveLength(2);
      expect(all[0].monthly_salary).toBe(50000);
      expect(all[1].monthly_salary).toBe(60000);
      expect(getLatestCycleSnapshot(driver)!.monthly_salary).toBe(60000);
    });

    it('with wipeExpenses:true soft-deletes all current-cycle expenses', () => {
      insertExpense(driver, { amount: 100, categoryId, paymentMethod: 'Cash', date: '2024-06-05' });
      insertExpense(driver, { amount: 200, categoryId, paymentMethod: 'GCash', date: '2024-06-15' });
      resetCurrentCycle(driver, { cycleStartDate: '2024-06-01', incomeMode: 'salary', monthlySalary: 60000, freelanceIncome: 0, expectedSavings: 12000, savingsTarget: 0, wipeExpenses: true });
      expect(listExpenses(driver, '2024-06-01')).toHaveLength(0);
      expect(listDeletedExpenses(driver)).toHaveLength(2);
    });

    it('with wipeExpenses:false leaves expenses untouched', () => {
      insertExpense(driver, { amount: 100, categoryId, paymentMethod: 'Cash', date: '2024-06-05' });
      resetCurrentCycle(driver, { cycleStartDate: '2024-06-01', incomeMode: 'salary', monthlySalary: 60000, freelanceIncome: 0, expectedSavings: 12000, savingsTarget: 0, wipeExpenses: false });
      expect(listExpenses(driver, '2024-06-01')).toHaveLength(1);
      expect(listDeletedExpenses(driver)).toHaveLength(0);
    });

    it('with wipeExpenses:true does not soft-delete expenses from prior cycles', () => {
      insertExpense(driver, { amount: 500, categoryId, paymentMethod: 'Cash', date: '2024-05-20' });
      insertExpense(driver, { amount: 100, categoryId, paymentMethod: 'Cash', date: '2024-06-05' });
      resetCurrentCycle(driver, { cycleStartDate: '2024-06-01', incomeMode: 'salary', monthlySalary: 60000, freelanceIncome: 0, expectedSavings: 12000, savingsTarget: 0, wipeExpenses: true });
      expect(listExpenses(driver)).toHaveLength(1);
      expect(listExpenses(driver)[0].amount).toBe(500);
    });
  });

  describe('listExpenses with since filter', () => {
    let categoryId: string;

    beforeEach(() => {
      seedDefaultCategories(driver);
      categoryId = listCategories(driver)[0].id as string;
    });

    it('excludes expenses before since date', () => {
      insertExpense(driver, { amount: 100, categoryId, paymentMethod: 'Cash', date: '2024-01-10' });
      insertExpense(driver, { amount: 200, categoryId, paymentMethod: 'Cash', date: '2024-01-20' });
      const expenses = listExpenses(driver, '2024-01-15');
      expect(expenses).toHaveLength(1);
      expect(expenses[0].date).toBe('2024-01-20');
    });

    it('includes expenses on the since date', () => {
      insertExpense(driver, { amount: 150, categoryId, paymentMethod: 'Cash', date: '2024-01-15' });
      const expenses = listExpenses(driver, '2024-01-15');
      expect(expenses).toHaveLength(1);
    });

    it('returns all expenses when since is not provided', () => {
      insertExpense(driver, { amount: 100, categoryId, paymentMethod: 'Cash', date: '2024-01-10' });
      insertExpense(driver, { amount: 200, categoryId, paymentMethod: 'Cash', date: '2024-01-20' });
      expect(listExpenses(driver)).toHaveLength(2);
    });
  });

  describe('isFirstLaunch / markLaunched', () => {
    it('returns true before the flag is set', () => {
      expect(isFirstLaunch(driver)).toBe(true);
    });

    it('returns false after markLaunched is called', () => {
      markLaunched(driver);
      expect(isFirstLaunch(driver)).toBe(false);
    });
  });
});
