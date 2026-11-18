import initSqlJs, { Database } from 'sql.js';
import { DbDriver } from '../src/db/driver';
import { runMigrations } from '../src/db/migrations';
import { insertExpense } from '../src/db/expenses';
import { listExpenses } from '../src/db/expenses';
import { seedDefaultCategories, listCategories } from '../src/db/categories';
import { isFirstLaunch, markLaunched } from '../src/db/firstLaunch';

function makeDriver(db: Database): DbDriver {
  return {
    execute(sql, params = []) {
      db.run(sql, params as any);
    },
    query<T>(sql: string, params: unknown[] = []): T[] {
      const stmt = db.prepare(sql);
      stmt.bind(params as any);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as unknown as T);
      }
      stmt.free();
      return rows;
    },
    queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
      const stmt = db.prepare(sql);
      stmt.bind(params as any);
      const hasRow = stmt.step();
      const result = hasRow ? (stmt.getAsObject() as unknown as T) : undefined;
      stmt.free();
      return result;
    },
  };
}

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
