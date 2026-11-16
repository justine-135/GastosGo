import { eq, lte } from "drizzle-orm";
import { db } from "../index";
import { syncQueueTable, type NewSyncQueueItem } from "../schema";
import { supabase } from "../../lib/supabase";

export async function enqueueSync(
  operation: "insert" | "update" | "delete",
  tableName: string,
  recordId: string,
  payload: object
) {
  const item: NewSyncQueueItem = {
    operation,
    tableName,
    recordId,
    payload: JSON.stringify(payload),
  };
  await db.insert(syncQueueTable).values(item);
}

const MAX_RETRIES = 5;

export async function drainSyncQueue() {
  const items = await db
    .select()
    .from(syncQueueTable)
    .where(lte(syncQueueTable.retryCount, MAX_RETRIES))
    .orderBy(syncQueueTable.createdAt);

  for (const item of items) {
    try {
      const payload = JSON.parse(item.payload);
      if (item.operation === "insert") {
        await supabase.from(item.tableName).upsert(payload);
      } else if (item.operation === "update") {
        await supabase.from(item.tableName).upsert(payload);
      } else {
        await supabase.from(item.tableName).delete().eq("id", item.recordId);
      }
      await db.delete(syncQueueTable).where(eq(syncQueueTable.id, item.id));
    } catch (e) {
      await db
        .update(syncQueueTable)
        .set({ retryCount: item.retryCount + 1, lastError: String(e) })
        .where(eq(syncQueueTable.id, item.id));
    }
  }
}
