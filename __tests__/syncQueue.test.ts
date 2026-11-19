import initSqlJs from 'sql.js';
import { makeDriver } from './helpers/makeDriver';
import { DbDriver } from '../src/db/driver';
import { runMigrations } from '../src/db/migrations';
import { enqueue, listPending, markReplicated } from '../src/db/syncQueue';

let driver: DbDriver;
beforeEach(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  driver = makeDriver(db);
  runMigrations(driver);
});

describe('sync_queue migration regression', () => {
  it('inserting TEXT uuid into INTEGER PRIMARY KEY throws (confirms the MISMATCH root cause)', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    const badDriver = makeDriver(db);
    badDriver.execute(`CREATE TABLE sync_queue (
      id         INTEGER PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation  TEXT NOT NULL,
      row_id     TEXT NOT NULL DEFAULT '',
      payload    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    // This is the scenario that causes SQLITE_MISMATCH on a real device
    expect(() =>
      badDriver.execute(
        `INSERT INTO sync_queue (id, table_name, operation, row_id, payload) VALUES (?, ?, ?, ?, ?)`,
        ['uuid-string-id', 'expenses', 'create', 'row-1', '{}'],
      ),
    ).toThrow();
  });

  it('enqueue works after migrating from INTEGER PRIMARY KEY + row_id schema', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    const legacyDriver = makeDriver(db);
    legacyDriver.execute(`CREATE TABLE sync_queue (
      id         INTEGER PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation  TEXT NOT NULL,
      row_id     TEXT NOT NULL DEFAULT '',
      payload    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    runMigrations(legacyDriver);
    expect(() =>
      enqueue(legacyDriver, 'expenses', 'create', 'abc-123', { amount: 50 }),
    ).not.toThrow();
  });

  it('enqueue works after migrating from TEXT PRIMARY KEY schema missing row_id', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    const legacyDriver = makeDriver(db);
    legacyDriver.execute(`CREATE TABLE sync_queue (
      id         TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation  TEXT NOT NULL,
      payload    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    runMigrations(legacyDriver);
    expect(() =>
      enqueue(legacyDriver, 'expenses', 'create', 'abc-123', { amount: 50 }),
    ).not.toThrow();
  });
});

describe('sync_queue', () => {
  it('enqueues an op and lists it as pending', () => {
    enqueue(driver, 'expenses', 'create', 'row-1', { amount: 100 });
    const pending = listPending(driver);
    expect(pending).toHaveLength(1);
    expect(pending[0].operation).toBe('create');
    expect(pending[0].row_id).toBe('row-1');
  });

  it('markReplicated removes the item from pending', () => {
    enqueue(driver, 'expenses', 'create', 'row-1', { amount: 100 });
    const [item] = listPending(driver);
    markReplicated(driver, item.id);
    expect(listPending(driver)).toHaveLength(0);
  });

  it('preserves multiple ops in creation order', () => {
    enqueue(driver, 'expenses', 'create', 'row-1', {});
    enqueue(driver, 'expenses', 'update', 'row-1', { amount: 200 });
    enqueue(driver, 'expenses', 'delete', 'row-2', {});
    const ops = listPending(driver).map(r => r.operation);
    expect(ops).toEqual(['create', 'update', 'delete']);
  });
});
