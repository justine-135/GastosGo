import * as SQLite from 'expo-sqlite';
import { DbDriver } from './driver';
import { runMigrations } from './migrations';
import { seedDefaultCategories } from './categories';
import { isFirstLaunch, markLaunched } from './firstLaunch';

let driver: DbDriver | null = null;

function makeDriver(db: SQLite.SQLiteDatabase): DbDriver {
  return {
    execute(sql, params = []) {
      db.runSync(sql, params as SQLite.SQLiteBindValue[]);
    },
    query<T>(sql: string, params: unknown[] = []): T[] {
      return db.getAllSync<T>(sql, params as SQLite.SQLiteBindValue[]);
    },
    queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
      return db.getFirstSync<T>(sql, params as SQLite.SQLiteBindValue[]) ?? undefined;
    },
  };
}

export function getDb(): DbDriver {
  if (driver) return driver;
  const db = SQLite.openDatabaseSync('gastosgo.db');
  driver = makeDriver(db);
  runMigrations(driver);
  if (isFirstLaunch(driver)) {
    seedDefaultCategories(driver);
    markLaunched(driver);
  }
  return driver;
}
