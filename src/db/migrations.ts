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

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id         TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation  TEXT NOT NULL,
  row_id     TEXT NOT NULL,
  payload    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function runMigrations(db: DbDriver): void {
  for (const statement of SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean)) {
    db.execute(statement);
  }
  try {
    db.execute(`ALTER TABLE categories ADD COLUMN carryover_enabled INTEGER NOT NULL DEFAULT 0`);
  } catch {
    // column already exists on installs that received the schema from the start
  }
}
