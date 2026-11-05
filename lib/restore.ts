import { supabase } from "./supabase";
import { runFullBackup as _runFullBackup } from "./backup";

// FK-safe restore order: categories before expenses
const SYNCED_TABLES = [
  "profiles",
  "categories",
  "expenses",
  "recurring_rules",
  "income_records",
] as const;

export async function runRestore(): Promise<{
  success: boolean;
  rowsRestored: number;
  errors: string[];
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, rowsRestored: 0, errors: ["No active session"] };

  const userId = session.user.id;

  // shortcut: DB upsert helpers not yet implemented — replace require stub with typed imports once db/queries/restore.ts exists
  let dbRestore: { upsertRows?: (table: string, rows: unknown[]) => Promise<void> } = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    dbRestore = require("../db/queries/restore") as typeof dbRestore;
  } catch {
    return { success: false, rowsRestored: 0, errors: ["DB restore helpers not available (DB-08/09/10)"] };
  }

  if (!dbRestore.upsertRows) {
    return { success: false, rowsRestored: 0, errors: ["DB restore helpers not available (DB-08/09/10)"] };
  }

  const allErrors: string[] = [];
  let rowsRestored = 0;

  for (const table of SYNCED_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId);

    if (error) {
      allErrors.push(`${table}: ${error.message}`);
      continue;
    }

    try {
      await dbRestore.upsertRows(table, data ?? []);
      rowsRestored += (data ?? []).length;
    } catch (err) {
      allErrors.push(`${table}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { success: allErrors.length === 0, rowsRestored, errors: allErrors };
}

// No-arg wrapper for settings.tsx — gets userId from active session
export async function runFullBackup(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");
  await _runFullBackup(session.user.id);
}
