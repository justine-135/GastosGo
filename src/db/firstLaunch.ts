import { DbDriver } from './driver';

export function isFirstLaunch(db: DbDriver): boolean {
  const row = db.queryOne<{ value: string }>(
    `SELECT value FROM app_flags WHERE key = 'launched'`,
  );
  return row === undefined;
}

export function markLaunched(db: DbDriver): void {
  db.execute(
    `INSERT OR REPLACE INTO app_flags (key, value) VALUES ('launched', '1')`,
  );
}
