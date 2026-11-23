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

CREATE TABLE IF NOT EXISTS cycle_snapshots (
  id               TEXT PRIMARY KEY,
  cycle_start_date TEXT NOT NULL UNIQUE,
  income_mode      TEXT NOT NULL,
  monthly_salary   REAL NOT NULL DEFAULT 0,
  freelance_income REAL NOT NULL DEFAULT 0,
  expected_savings REAL NOT NULL DEFAULT 0,
  savings_target   REAL NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recurring_rules (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  amount          REAL NOT NULL,
  category_id     TEXT REFERENCES categories(id) ON DELETE SET NULL,
  frequency       TEXT NOT NULL,
  recurrence_day  INTEGER NOT NULL,
  next_due_date   TEXT NOT NULL,
  behaviour       TEXT NOT NULL DEFAULT 'remind_me',
  is_active       INTEGER NOT NULL DEFAULT 1,
  payment_method  TEXT NOT NULL DEFAULT 'Cash',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function runMigrations(db: DbDriver): void {
  for (const statement of SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean)) {
    db.execute(statement);
  }
  try {
    db.execute(`ALTER TABLE categories ADD COLUMN carryover_enabled INTEGER NOT NULL DEFAULT 0`);
  } catch { /* already exists */ }
  try {
    db.execute(`ALTER TABLE categories ADD COLUMN deleted_at TEXT`);
  } catch { /* already exists */ }
  try {
    db.execute(`ALTER TABLE expenses ADD COLUMN deleted_at TEXT`);
  } catch { /* already exists */ }
  try {
    db.execute(`ALTER TABLE expenses ADD COLUMN is_recurring INTEGER NOT NULL DEFAULT 0`);
  } catch { /* already exists */ }
  try {
    db.execute(`ALTER TABLE expenses ADD COLUMN recurring_rule_id TEXT`);
  } catch { /* already exists */ }
  const syncQueueCols = db.query<{ name: string; type: string }>(`PRAGMA table_info(sync_queue)`);
  const syncQueueIdType = syncQueueCols.find(col => col.name === 'id')?.type;
  const syncQueueHasRowId = syncQueueCols.some(col => col.name === 'row_id');
  if (!syncQueueHasRowId || syncQueueIdType !== 'TEXT') {
    db.execute(`DROP TABLE IF EXISTS sync_queue`);
    db.execute(
      `CREATE TABLE sync_queue (
        id         TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation  TEXT NOT NULL,
        row_id     TEXT NOT NULL DEFAULT '',
        payload    TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    );
  }
}
