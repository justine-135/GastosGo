import NetInfo from "@react-native-community/netinfo";
import { supabase } from "./supabase";

// shortcut: DB-11 not yet implemented — replace these stubs once db/queries/syncQueue.ts exists
import type {
  getPendingItems as GetPendingItems,
  deleteItem as DeleteItem,
  incrementRetry as IncrementRetry,
} from "../db/queries/syncQueue";

// Dynamically require so the module is optional during BE-only dev
function getQueue() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("../db/queries/syncQueue") as {
      getPendingItems: typeof GetPendingItems;
      deleteItem: typeof DeleteItem;
      incrementRetry: typeof IncrementRetry;
    };
  } catch {
    return null;
  }
}

const MAX_RETRY = 5;
const BATCH_SIZE = 50;

export async function runSync() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return; // no auth — skip

  const net = await NetInfo.fetch();
  if (!net.isConnected) return; // offline — skip

  const queue = getQueue();
  if (!queue) return; // DB-11 not yet available — skip

  const items = await queue.getPendingItems(BATCH_SIZE);

  for (const item of items) {
    if (item.retryCount >= MAX_RETRY) continue; // flagged for manual review

    try {
      if (item.operation === "delete") {
        const { error } = await supabase
          .from(item.tableName)
          .delete()
          .eq("id", item.recordId);
        if (error) throw error;
      } else {
        // insert or update — last-write-wins upsert
        const payload = JSON.parse(item.payload);
        const { error } = await supabase
          .from(item.tableName)
          .upsert(payload, { onConflict: "id" });
        if (error) throw error;
      }

      await queue.deleteItem(item.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await queue.incrementRetry(item.id, msg);
    }
  }
}

// Listen for reconnect events and drain the queue automatically
NetInfo.addEventListener((state) => {
  if (state.isConnected) runSync();
});
