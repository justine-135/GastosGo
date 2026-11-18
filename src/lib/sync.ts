import { supabase } from './supabase';
import { getDb } from '../db';
import { listPending, markReplicated } from '../db/syncQueue';

export async function drainSyncQueue(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const userId = session.user.id;
  const db = getDb();
  const pending = listPending(db);

  for (const item of pending) {
    const payload = { ...JSON.parse(item.payload), user_id: userId };
    let error: unknown;

    if (item.operation === 'create' || item.operation === 'update') {
      ({ error } = await supabase.from(item.table_name).upsert(payload));
    } else {
      ({ error } = await supabase.from(item.table_name).delete().eq('id', item.row_id));
    }

    if (!error) markReplicated(db, item.id);
  }
}
