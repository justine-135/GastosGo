import { DbDriver } from './driver';
import { generateId } from '../utils/generateId';

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
  return expenseId;
}

export function listExpenses(db: DbDriver): ExpenseRow[] {
  return db.query<ExpenseRow>(
    `SELECT * FROM expenses WHERE deleted_at IS NULL ORDER BY date DESC, created_at DESC`,
  );
}
