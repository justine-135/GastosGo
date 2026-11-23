import { DbDriver } from './driver';
import { generateId } from '../utils/generateId';
import { enqueue } from './syncQueue';
import { computeNextDueDate } from '../utils/computeNextDueDate';
import { todayStr } from '../utils/fmtPeso';

export interface RecurringRuleRow {
  id: string;
  name: string;
  amount: number;
  category_id: string | null;
  frequency: 'monthly' | 'weekly';
  recurrence_day: number;
  next_due_date: string;
  behaviour: string;
  is_active: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface InsertRuleInput {
  name: string;
  amount: number;
  categoryId: string;
  frequency: 'monthly' | 'weekly';
  recurrenceDay: number;
  paymentMethod: string;
}

export interface UpdateRuleInput {
  name?: string;
  amount?: number;
  categoryId?: string;
  frequency?: 'monthly' | 'weekly';
  recurrenceDay?: number;
  paymentMethod?: string;
}

export function getRule(db: DbDriver, id: string): RecurringRuleRow | undefined {
  return db.queryOne<RecurringRuleRow>(`SELECT * FROM recurring_rules WHERE id = ?`, [id]);
}

export function listRules(db: DbDriver): RecurringRuleRow[] {
  return db.query<RecurringRuleRow>(`SELECT * FROM recurring_rules ORDER BY next_due_date ASC`);
}

export function listUpcomingRules(db: DbDriver, today: string): RecurringRuleRow[] {
  return db.query<RecurringRuleRow>(
    `SELECT * FROM recurring_rules
     WHERE is_active = 1 AND (next_due_date <= date(?, '+7 days') OR next_due_date < ?)
     ORDER BY next_due_date ASC`,
    [today, today],
  );
}

export function insertRule(db: DbDriver, input: InsertRuleInput): string {
  const ruleId = generateId();
  const today = todayStr();
  const nextDueDate = computeNextDueDate(input.recurrenceDay, input.frequency, today);
  db.execute(
    `INSERT INTO recurring_rules (id, name, amount, category_id, frequency, recurrence_day, next_due_date, behaviour, is_active, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'remind_me', 1, ?)`,
    [ruleId, input.name, input.amount, input.categoryId, input.frequency, input.recurrenceDay, nextDueDate, input.paymentMethod],
  );
  enqueue(db, 'recurring_rules', 'create', ruleId, {
    id: ruleId,
    name: input.name,
    amount: input.amount,
    category_id: input.categoryId,
    frequency: input.frequency,
    recurrence_day: input.recurrenceDay,
    next_due_date: nextDueDate,
    behaviour: 'remind_me',
    is_active: true,
    payment_method: input.paymentMethod,
  });
  return ruleId;
}

export function updateRule(db: DbDriver, id: string, input: UpdateRuleInput): void {
  const existing = getRule(db, id);
  if (!existing) return;

  const name = input.name ?? existing.name;
  const amount = input.amount ?? existing.amount;
  const categoryId = input.categoryId ?? existing.category_id;
  const frequency = input.frequency ?? existing.frequency;
  const recurrenceDay = input.recurrenceDay ?? existing.recurrence_day;
  const paymentMethod = input.paymentMethod ?? existing.payment_method;

  const frequencyChanged = input.frequency !== undefined && input.frequency !== existing.frequency;
  const dayChanged = input.recurrenceDay !== undefined && input.recurrenceDay !== existing.recurrence_day;
  const nextDueDate = (frequencyChanged || dayChanged)
    ? computeNextDueDate(recurrenceDay, frequency, todayStr())
    : existing.next_due_date;

  db.execute(
    `UPDATE recurring_rules SET name = ?, amount = ?, category_id = ?, frequency = ?, recurrence_day = ?, next_due_date = ?, payment_method = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [name, amount, categoryId, frequency, recurrenceDay, nextDueDate, paymentMethod, id],
  );
  enqueue(db, 'recurring_rules', 'update', id, {
    id,
    name,
    amount,
    category_id: categoryId,
    frequency,
    recurrence_day: recurrenceDay,
    next_due_date: nextDueDate,
    payment_method: paymentMethod,
  });
}

export function deactivateRule(db: DbDriver, id: string): void {
  db.execute(`UPDATE recurring_rules SET is_active = 0, updated_at = datetime('now') WHERE id = ?`, [id]);
  enqueue(db, 'recurring_rules', 'update', id, { id, is_active: false });
}

export function activateRule(db: DbDriver, id: string): void {
  db.execute(`UPDATE recurring_rules SET is_active = 1, updated_at = datetime('now') WHERE id = ?`, [id]);
  enqueue(db, 'recurring_rules', 'update', id, { id, is_active: true });
}

export function deleteRule(db: DbDriver, id: string): void {
  db.execute(`DELETE FROM recurring_rules WHERE id = ?`, [id]);
  enqueue(db, 'recurring_rules', 'delete', id, { id });
}

function advanceToFuture(nextDueDate: string, recurrenceDay: number, frequency: 'monthly' | 'weekly', today: string): string {
  let cursor = nextDueDate;
  while (cursor <= today) {
    const [year, month, day] = cursor.split('-').map(Number);
    const dayAfter = new Date(year, month - 1, day + 1);
    const dayAfterStr = [
      dayAfter.getFullYear(),
      String(dayAfter.getMonth() + 1).padStart(2, '0'),
      String(dayAfter.getDate()).padStart(2, '0'),
    ].join('-');
    cursor = computeNextDueDate(recurrenceDay, frequency, dayAfterStr);
  }
  return cursor;
}

export function markAsPaid(db: DbDriver, ruleId: string): string {
  const rule = getRule(db, ruleId);
  if (!rule) throw new Error(`Rule ${ruleId} not found`);

  const today = todayStr();
  const expenseId = generateId();
  db.execute(
    `INSERT INTO expenses (id, amount, category_id, payment_method, date, is_recurring, recurring_rule_id)
     VALUES (?, ?, ?, ?, ?, 1, ?)`,
    [expenseId, rule.amount, rule.category_id, rule.payment_method, today, ruleId],
  );
  enqueue(db, 'expenses', 'create', expenseId, {
    id: expenseId,
    amount: rule.amount,
    category_id: rule.category_id,
    payment_method: rule.payment_method,
    date: today,
    is_recurring: true,
    recurring_rule_id: ruleId,
  });

  const newNextDueDate = advanceToFuture(rule.next_due_date, rule.recurrence_day, rule.frequency, today);
  db.execute(
    `UPDATE recurring_rules SET next_due_date = ?, updated_at = datetime('now') WHERE id = ?`,
    [newNextDueDate, ruleId],
  );
  enqueue(db, 'recurring_rules', 'update', ruleId, { id: ruleId, next_due_date: newNextDueDate });

  return expenseId;
}

export function skipRule(db: DbDriver, ruleId: string): void {
  const rule = getRule(db, ruleId);
  if (!rule) throw new Error(`Rule ${ruleId} not found`);

  const today = todayStr();
  const newNextDueDate = advanceToFuture(rule.next_due_date, rule.recurrence_day, rule.frequency, today);
  db.execute(
    `UPDATE recurring_rules SET next_due_date = ?, updated_at = datetime('now') WHERE id = ?`,
    [newNextDueDate, ruleId],
  );
  enqueue(db, 'recurring_rules', 'update', ruleId, { id: ruleId, next_due_date: newNextDueDate });
}
