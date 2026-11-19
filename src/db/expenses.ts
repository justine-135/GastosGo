import { DbDriver } from './driver';
import { generateId } from '../utils/generateId';
import { enqueue } from './syncQueue';

export interface ExpenseRow {
  id: string;
  amount: number;
  category_id: string | null;
  merchant: string | null;
  notes: string | null;
  payment_method: string;
  date: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsertExpenseInput {
  amount: number;
  categoryId: string | null;
  paymentMethod: string;
  date: string;
  merchant?: string;
  notes?: string;
}

export function insertExpense(db: DbDriver, input: InsertExpenseInput): string {
  const expenseId = generateId();
  db.execute(
    `INSERT INTO expenses (id, amount, category_id, payment_method, date, merchant, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [expenseId, input.amount, input.categoryId ?? null, input.paymentMethod, input.date, input.merchant ?? null, input.notes ?? null],
  );
  enqueue(db, 'expenses', 'create', expenseId, {
    id: expenseId,
    amount: input.amount,
    category_id: input.categoryId ?? null,
    payment_method: input.paymentMethod,
    date: input.date,
    merchant: input.merchant ?? null,
    notes: input.notes ?? null,
  });
  return expenseId;
}

export function listExpenses(db: DbDriver, since?: string): ExpenseRow[] {
  if (since) {
    return db.query<ExpenseRow>(
      `SELECT * FROM expenses WHERE deleted_at IS NULL AND date >= ? ORDER BY date DESC, created_at DESC`,
      [since],
    );
  }
  return db.query<ExpenseRow>(
    `SELECT * FROM expenses WHERE deleted_at IS NULL ORDER BY date DESC, created_at DESC`,
  );
}

export function softDeleteExpense(db: DbDriver, id: string): void {
  db.execute(
    `UPDATE expenses SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
  enqueue(db, 'expenses', 'delete', id, { id });
}

export function listDeletedExpenses(db: DbDriver): ExpenseRow[] {
  return db.query<ExpenseRow>(
    `SELECT * FROM expenses WHERE deleted_at IS NOT NULL AND deleted_at >= datetime('now', '-30 days') ORDER BY deleted_at DESC`,
  );
}

export function restoreExpense(db: DbDriver, id: string): void {
  db.execute(
    `UPDATE expenses SET deleted_at = NULL, updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
  enqueue(db, 'expenses', 'update', id, { id, deleted_at: null });
}
