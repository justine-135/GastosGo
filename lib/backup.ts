import { supabase } from "./supabase";

// shortcut: DB-08/09/10 helpers assumed available — replace any() casts with typed imports once DB tasks are done
type AnyRecord = Record<string, unknown>;

const BATCH_SIZE = 100;

async function upsertBatched(
  table: string,
  rows: AnyRecord[]
): Promise<string[]> {
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: "id" });
    if (error) errors.push(`${table}[${i}]: ${error.message}`);
  }
  return errors;
}

/**
 * Full local-to-cloud backup. Reads all rows from every synced table and
 * upserts them to Supabase. Idempotent — safe to run multiple times.
 */
export async function runFullBackup(_userId: string): Promise<{
  success: boolean;
  rowsUploaded: number;
  errors: string[];
}> {
  // shortcut: DB-08/09/10 not yet implemented — replace require stubs with typed imports
  let db: {
    getAllCategories?: (uid: string) => Promise<AnyRecord[]>;
    getAllExpenses?: (uid: string) => Promise<AnyRecord[]>;
    getAllRecurringRules?: (uid: string) => Promise<AnyRecord[]>;
    getAllIncomeRecords?: (uid: string) => Promise<AnyRecord[]>;
    getAllProfiles?: (uid: string) => Promise<AnyRecord[]>;
  } = {};
  try {
    db = require("../db/queries/backup") as typeof db;
  } catch {
    // DB layer not ready — return early rather than silently uploading nothing
    return { success: false, rowsUploaded: 0, errors: ["DB query helpers not available (DB-08/09/10)"] };
  }

  const allErrors: string[] = [];
  let rowsUploaded = 0;

  // Order matters: categories before expenses (FK)
  const tables: Array<{ key: keyof typeof db; supabaseTable: string }> = [
    { key: "getAllProfiles",        supabaseTable: "profiles" },
    { key: "getAllCategories",      supabaseTable: "categories" },
    { key: "getAllExpenses",        supabaseTable: "expenses" },
    { key: "getAllRecurringRules",  supabaseTable: "recurring_rules" },
    { key: "getAllIncomeRecords",   supabaseTable: "income_records" },
  ];

  for (const { key, supabaseTable } of tables) {
    const fn = db[key];
    if (!fn) continue;
    const rows = await fn(_userId);
    const errs = await upsertBatched(supabaseTable, rows);
    allErrors.push(...errs);
    rowsUploaded += rows.length - errs.length;
  }

  return { success: allErrors.length === 0, rowsUploaded, errors: allErrors };
}
