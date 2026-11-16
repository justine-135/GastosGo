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

// camelCase → snake_case so PostgREST column names match
function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.replace(/([A-Z])/g, "_$1").toLowerCase(), v])
  );
}

const MAX_RETRIES = 5;

export async function drainSyncQueue(supabaseUid: string) {
  const items = await db
    .select()
    .from(syncQueueTable)
    .where(lte(syncQueueTable.retryCount, MAX_RETRIES))
    .orderBy(syncQueueTable.createdAt);

  for (const item of items) {
    try {
      if (item.operation === "delete") {
        const { error } = await supabase.from(item.tableName).delete().eq("id", item.recordId);
        if (error) throw error;
      } else {
        const payload = { ...toSnake(JSON.parse(item.payload)), user_id: supabaseUid };
        const { error } = await supabase.from(item.tableName).upsert(payload);
        if (error) throw error;
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
