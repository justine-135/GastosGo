import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const syncQueueTable = sqliteTable(
  "sync_queue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    operation: text("operation", { enum: ["insert", "update", "delete"] }).notNull(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    payload: text("payload").notNull(), // JSON string
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    retryCount: integer("retry_count").notNull().default(0),
    lastError: text("last_error"),
  },
  (t) => [
    // supports ordered draining by insertion time
    index("sync_queue_created_at_idx").on(t.createdAt),
  ]
);

export type SyncQueueItem = typeof syncQueueTable.$inferSelect;
export type NewSyncQueueItem = typeof syncQueueTable.$inferInsert;
