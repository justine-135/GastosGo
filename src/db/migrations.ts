import { DbDriver } from './driver';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  icon              TEXT NOT NULL,
  color             TEXT NOT NULL,
  monthly_budget    REAL NOT NULL DEFAULT 0,
  carryover_enabled INTEGER NOT NULL DEFAULT 0,
  deleted_at        TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id             TEXT PRIMARY KEY,
  amount         REAL NOT NULL,
  category_id    TEXT REFERENCES categories(id) ON DELETE SET NULL,
  merchant       TEXT,
  notes          TEXT,
  payment_method TEXT NOT NULL,
  date           TEXT NOT NULL,
  deleted_at     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_flags (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export function runMigrations(db: DbDriver): void {
  for (const statement of SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean)) {
    db.execute(statement);
  }
}
