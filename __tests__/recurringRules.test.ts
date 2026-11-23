import initSqlJs from 'sql.js';
import { makeDriver } from './helpers/makeDriver';
import { DbDriver } from '../src/db/driver';
import { runMigrations } from '../src/db/migrations';
import { seedDefaultCategories, listCategories } from '../src/db/categories';
import { listPending } from '../src/db/syncQueue';
import {
  insertRule,
  getRule,
  listRules,
  listUpcomingRules,
  updateRule,
  deactivateRule,
  activateRule,
  deleteRule,
  markAsPaid,
  skipRule,
} from '../src/db/recurringRules';

describe('Recurring Rules', () => {
  let driver: DbDriver;
  let categoryId: string;

  beforeEach(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    driver = makeDriver(db);
    runMigrations(driver);
    seedDefaultCategories(driver);
    categoryId = listCategories(driver)[0].id;
  });

  const baseInput = () => ({
    name: 'Netflix',
    amount: 549,
    categoryId,
    frequency: 'monthly' as const,
    recurrenceDay: 15,
    paymentMethod: 'GCash',
  });

  describe('insertRule / getRule / listRules', () => {
    it('inserts a rule with correct fields', () => {
      const ruleId = insertRule(driver, baseInput());
      const rule = getRule(driver, ruleId);
      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Netflix');
      expect(rule!.amount).toBe(549);
      expect(rule!.category_id).toBe(categoryId);
      expect(rule!.frequency).toBe('monthly');
      expect(rule!.recurrence_day).toBe(15);
      expect(rule!.behaviour).toBe('remind_me');
      expect(rule!.is_active).toBe(1);
      expect(rule!.payment_method).toBe('GCash');
    });

    it('appears in listRules', () => {
      insertRule(driver, baseInput());
      expect(listRules(driver)).toHaveLength(1);
    });
  });

  describe('updateRule', () => {
    it('updates name and amount', () => {
      const ruleId = insertRule(driver, baseInput());
      updateRule(driver, ruleId, { name: 'Spotify', amount: 199 });
      const rule = getRule(driver, ruleId);
      expect(rule!.name).toBe('Spotify');
      expect(rule!.amount).toBe(199);
    });

    it('recomputes next_due_date when recurrenceDay changes', () => {
      const ruleId = insertRule(driver, baseInput());
      const before = getRule(driver, ruleId)!.next_due_date;
      updateRule(driver, ruleId, { recurrenceDay: 28 });
      const after = getRule(driver, ruleId)!.next_due_date;
      expect(after).not.toBe(before);
    });
  });

  describe('deactivateRule / activateRule', () => {
    it('toggles is_active', () => {
      const ruleId = insertRule(driver, baseInput());
      deactivateRule(driver, ruleId);
      expect(getRule(driver, ruleId)!.is_active).toBe(0);
      activateRule(driver, ruleId);
      expect(getRule(driver, ruleId)!.is_active).toBe(1);
    });
  });

  describe('deleteRule', () => {
    it('removes rule from listRules', () => {
      const ruleId = insertRule(driver, baseInput());
      deleteRule(driver, ruleId);
      expect(listRules(driver)).toHaveLength(0);
    });
  });

  describe('listUpcomingRules', () => {
    it('includes overdue active rules and excludes far-future rules', () => {
      const ruleId = insertRule(driver, baseInput());
      driver.execute(
        `UPDATE recurring_rules SET next_due_date = '2020-01-01' WHERE id = ?`,
        [ruleId],
      );
      const farRuleId = insertRule(driver, { ...baseInput(), name: 'Far Future' });
      driver.execute(
        `UPDATE recurring_rules SET next_due_date = '2099-12-31' WHERE id = ?`,
        [farRuleId],
      );

      const upcoming = listUpcomingRules(driver, '2026-11-23');
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].name).toBe('Netflix');
    });

    it('excludes inactive rules', () => {
      const ruleId = insertRule(driver, baseInput());
      deactivateRule(driver, ruleId);
      driver.execute(
        `UPDATE recurring_rules SET next_due_date = '2026-11-23' WHERE id = ?`,
        [ruleId],
      );
      expect(listUpcomingRules(driver, '2026-11-23')).toHaveLength(0);
    });
  });

  describe('markAsPaid', () => {
    it('creates an expense with recurring fields and advances next_due_date', () => {
      const ruleId = insertRule(driver, baseInput());
      driver.execute(
        `UPDATE recurring_rules SET next_due_date = '2026-11-15' WHERE id = ?`,
        [ruleId],
      );

      const expenseId = markAsPaid(driver, ruleId);
      const expense = driver.queryOne<{
        id: string;
        amount: number;
        is_recurring: number;
        recurring_rule_id: string;
        category_id: string;
        payment_method: string;
      }>(`SELECT * FROM expenses WHERE id = ?`, [expenseId]);

      expect(expense).toBeDefined();
      expect(expense!.amount).toBe(549);
      expect(expense!.is_recurring).toBe(1);
      expect(expense!.recurring_rule_id).toBe(ruleId);
      expect(expense!.category_id).toBe(categoryId);
      expect(expense!.payment_method).toBe('GCash');

      const rule = getRule(driver, ruleId);
      expect(rule!.next_due_date > '2026-11-23').toBe(true);
    });

    it('catches up multi-period overdue in one call with one expense', () => {
      const ruleId = insertRule(driver, baseInput());
      driver.execute(
        `UPDATE recurring_rules SET next_due_date = '2026-06-15' WHERE id = ?`,
        [ruleId],
      );

      markAsPaid(driver, ruleId);

      const expenses = driver.query<{ id: string }>(`SELECT * FROM expenses`);
      expect(expenses).toHaveLength(1);

      const rule = getRule(driver, ruleId);
      expect(rule!.next_due_date > '2026-11-23').toBe(true);
    });
  });

  describe('skipRule', () => {
    it('advances next_due_date without creating an expense', () => {
      const ruleId = insertRule(driver, baseInput());
      driver.execute(
        `UPDATE recurring_rules SET next_due_date = '2026-11-15' WHERE id = ?`,
        [ruleId],
      );

      skipRule(driver, ruleId);

      const expenses = driver.query<{ id: string }>(`SELECT * FROM expenses`);
      expect(expenses).toHaveLength(0);

      const rule = getRule(driver, ruleId);
      expect(rule!.next_due_date > '2026-11-23').toBe(true);
    });
  });

  describe('sync queue integration', () => {
    it('enqueues create for insertRule', () => {
      insertRule(driver, baseInput());
      const pending = listPending(driver);
      expect(pending.some(entry => entry.table_name === 'recurring_rules' && entry.operation === 'create')).toBe(true);
    });

    it('enqueues update for updateRule', () => {
      const ruleId = insertRule(driver, baseInput());
      updateRule(driver, ruleId, { name: 'Spotify' });
      const pending = listPending(driver);
      expect(pending.some(entry => entry.table_name === 'recurring_rules' && entry.operation === 'update')).toBe(true);
    });

    it('enqueues delete for deleteRule', () => {
      const ruleId = insertRule(driver, baseInput());
      deleteRule(driver, ruleId);
      const pending = listPending(driver);
      expect(pending.some(entry => entry.table_name === 'recurring_rules' && entry.operation === 'delete')).toBe(true);
    });

    it('enqueues expense create and rule update for markAsPaid', () => {
      const ruleId = insertRule(driver, baseInput());
      driver.execute(`UPDATE recurring_rules SET next_due_date = '2026-11-15' WHERE id = ?`, [ruleId]);
      markAsPaid(driver, ruleId);
      const pending = listPending(driver);
      expect(pending.some(entry => entry.table_name === 'expenses' && entry.operation === 'create')).toBe(true);
      const ruleUpdates = pending.filter(entry => entry.table_name === 'recurring_rules' && entry.operation === 'update');
      expect(ruleUpdates.length).toBeGreaterThan(0);
    });
  });
});
