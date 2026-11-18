import { DbDriver } from './driver';
import { generateId } from '../utils/generateId';

export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueRow {
  id: string;
  table_name: string;
  operation: SyncOperation;
  row_id: string;
  payload: string;
  created_at: string;
}

export function enqueue(
  db: DbDriver,
  tableName: string,
  operation: SyncOperation,
  rowId: string,
  payload: Record<string, unknown>,
): void {
  db.execute(
    `INSERT INTO sync_queue (id, table_name, operation, row_id, payload) VALUES (?, ?, ?, ?, ?)`,
    [generateId(), tableName, operation, rowId, JSON.stringify(payload)],
  );
}

export function listPending(db: DbDriver): SyncQueueRow[] {
  return db.query<SyncQueueRow>(`SELECT * FROM sync_queue ORDER BY created_at ASC`);
}

export function markReplicated(db: DbDriver, id: string): void {
  db.execute(`DELETE FROM sync_queue WHERE id = ?`, [id]);
}
