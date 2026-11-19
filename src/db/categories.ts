import { DbDriver } from './driver';

export interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthly_budget: number;
  carryover_enabled: number; // shortcut: SQLite stores 0/1; callers bridge to boolean manually, upgrade to a typed wrapper when categories gain more boolean flags
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_CATEGORIES: Omit<CategoryRow, 'deleted_at' | 'created_at' | 'updated_at'>[] = [
  { id: 'cat-food',       name: 'Food',        icon: '🍚', color: '#F97316', monthly_budget: 0, carryover_enabled: 0 },
  { id: 'cat-transport',  name: 'Transport',   icon: '🚌', color: '#3B82F6', monthly_budget: 0, carryover_enabled: 0 },
  { id: 'cat-bills',      name: 'Bills',       icon: '⚡', color: '#8B5CF6', monthly_budget: 0, carryover_enabled: 0 },
  { id: 'cat-health',     name: 'Health',      icon: '💊', color: '#EF4444', monthly_budget: 0, carryover_enabled: 0 },
  { id: 'cat-shopping',   name: 'Shopping',    icon: '🛍️', color: '#EC4899', monthly_budget: 0, carryover_enabled: 0 },
  { id: 'cat-leisure',    name: 'Leisure',     icon: '🎮', color: '#10B981', monthly_budget: 0, carryover_enabled: 0 },
  { id: 'cat-others',     name: 'Others',      icon: '📦', color: '#6B7280', monthly_budget: 0, carryover_enabled: 0 },
];

export function seedDefaultCategories(db: DbDriver): void {
  for (const category of DEFAULT_CATEGORIES) {
    db.execute(
      `INSERT OR IGNORE INTO categories (id, name, icon, color, monthly_budget, carryover_enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category.id, category.name, category.icon, category.color, category.monthly_budget, category.carryover_enabled],
    );
  }
}

export function listCategories(db: DbDriver): CategoryRow[] {
  return db.query<CategoryRow>(`SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY name ASC`);
}

export function updateCategoryBudget(
  db: DbDriver,
  id: string,
  monthlyBudget: number,
  carryoverEnabled: boolean,
): void {
  db.execute(
    `UPDATE categories SET monthly_budget = ?, carryover_enabled = ?, updated_at = datetime('now') WHERE id = ?`,
    [monthlyBudget, carryoverEnabled ? 1 : 0, id],
  );
}
