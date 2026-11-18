import initSqlJs, { Database } from 'sql.js';
import { DbDriver } from '../src/db/driver';
import { runMigrations } from '../src/db/migrations';
import { enqueue, listPending, markReplicated } from '../src/db/syncQueue';

function makeDriver(db: Database): DbDriver {
  return {
    execute(sql, params = []) { db.run(sql, params as any); },
    query<T>(sql: string, params: unknown[] = []): T[] {
      const stmt = db.prepare(sql);
      stmt.bind(params as any);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as unknown as T);
      stmt.free();
      return rows;
    },
    queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
      const stmt = db.prepare(sql);
      stmt.bind(params as any);
      const result = stmt.step() ? (stmt.getAsObject() as unknown as T) : undefined;
      stmt.free();
      return result;
    },
  };
}

let driver: DbDriver;
beforeEach(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  driver = makeDriver(db);
  runMigrations(driver);
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
