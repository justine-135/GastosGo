import { Database } from 'sql.js';
import { DbDriver } from '../../src/db/driver';

export function makeDriver(db: Database): DbDriver {
  return {
    execute(sql, params = []) {
      db.run(sql, params as any);
    },
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
