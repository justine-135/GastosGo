import { asc, eq, sql } from "drizzle-orm";
import { db } from "../client";
import { syncQueueTable } from "../schema";

type Operation = "insert" | "update" | "delete";

export function enqueue(
  operation: Operation,
  tableName: string,
  recordId: string,
  payload: object
) {
  return db
    .insert(syncQueueTable)
    .values({ operation, tableName, recordId, payload: JSON.stringify(payload) })
    .returning();
}

export function getPendingItems(limit: number) {
  return db
    .select()
    .from(syncQueueTable)
    .orderBy(asc(syncQueueTable.id))
    .limit(limit);
}

export function deleteItem(id: number) {
  return db.delete(syncQueueTable).where(eq(syncQueueTable.id, id));
}

export async function incrementRetry(id: number, error: string): Promise<void> {
  // Always records the error — no silent drop
  await db
    .update(syncQueueTable)
    .set({
      retryCount: sql`${syncQueueTable.retryCount} + 1`,
      lastError: error,
    })
    .where(eq(syncQueueTable.id, id));
}

export async function getPendingCount(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(syncQueueTable);
  return row?.count ?? 0;
}
