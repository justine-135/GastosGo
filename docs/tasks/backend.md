# GastosGo — Backend Tasks (Supabase + Sync + Push)

Layer: **BE**
All tasks target `lib/`, `supabase/`, and server-side configuration. Tasks are independent of one another within this layer.

---

## BE-01: Supabase Project Bootstrap

**Title:** Create Supabase project and configure environment variables

**Description:**
Create the GastosGo Supabase project (or provision via CLI), capture the project URL and anon/service-role keys, and wire them into the app via `lib/supabase.ts`. The client is a singleton using `@supabase/supabase-js` with the `AsyncStorage` session adapter from `@react-native-async-storage/async-storage`.

**Acceptance Criteria:**
- [ ] Supabase project created in the `ap-southeast-1` (Singapore) region for latency proximity to PH users
- [ ] `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` defined in `.env.local` and `.env.example`
- [ ] `lib/supabase.ts` exports a singleton `supabase` client configured with `AsyncStorage` for session persistence
- [ ] `.env.local` is in `.gitignore`; `.env.example` is committed with placeholder values
- [ ] `supabase.auth.getSession()` returns a session object in a minimal test script (non-null)

**Effort:** S
**Layer Dependencies:** None

---

## BE-02: Supabase Postgres Schema — Mirror Tables

**Title:** Create Postgres mirror tables for all synced entities

**Description:**
Write a Supabase migration (`supabase/migrations/`) that creates the cloud-side Postgres tables mirroring the SQLite schema: `users`, `profiles`, `categories`, `expenses`, `recurring_rules`, `income_records`. These are the sync targets. Columns match the SQLite schema; use `uuid` PKs and `timestamptz` for timestamps.

**Acceptance Criteria:**
- [ ] Migration file exists under `supabase/migrations/` and is tracked in source control
- [ ] Tables: `users`, `profiles`, `categories`, `expenses`, `recurring_rules`, `income_records`
- [ ] All tables have `user_id uuid NOT NULL` referencing `auth.users(id)` with `ON DELETE CASCADE`
- [ ] `expenses.synced_at` is `timestamptz` nullable
- [ ] `supabase db push` applies migration without error on a fresh project
- [ ] No sync queue table in Postgres (queue is SQLite-only; Postgres receives final state)

**Effort:** M
**Layer Dependencies:** BE-01

---

## BE-03: Row Level Security Policies

**Title:** Implement RLS policies for all synced tables

**Description:**
Enable RLS on every synced table and write `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies that gate access to `auth.uid() = user_id`. This is the primary security layer — no row is accessible to any user other than its owner. Anonymous auth users get the same enforcement.

**Acceptance Criteria:**
- [ ] RLS enabled on: `profiles`, `categories`, `expenses`, `recurring_rules`, `income_records`
- [ ] Each table has four policies: select, insert, update, delete — all scoped to `auth.uid() = user_id`
- [ ] `INSERT` policy also verifies `user_id = auth.uid()` (prevents impersonation on insert)
- [ ] Service-role key bypasses RLS (for admin/edge functions only — never shipped in the app bundle)
- [ ] Verified manually: querying with User A's JWT cannot return User B's rows
- [ ] Policies included in the same migration file as BE-02 or a follow-on migration

**Effort:** M
**Layer Dependencies:** BE-02

---

## BE-04: Anonymous Auth Flow

**Title:** Implement anonymous Supabase auth with optional account upgrade path

**Description:**
GastosGo requires no sign-up to start. On first launch, call `supabase.auth.signInAnonymously()` and persist the resulting session. The anonymous user's `auth.uid()` becomes the `user_id` on all Postgres rows. Expose an `upgradeAccount(email, password)` utility in `lib/auth.ts` for future upgrade (not an MVP screen, but the utility must work so the upgrade screen can be added later).

**Acceptance Criteria:**
- [ ] `lib/auth.ts` exports `signInAnonymously()` — creates or reuses an anonymous session
- [ ] `signInAnonymously()` is called once from app root before any sync attempt, idempotent if session already exists
- [ ] Session is persisted via `AsyncStorage` and survives app restarts
- [ ] `upgradeAccount(email, password)` calls `supabase.auth.updateUser()` and returns the upgraded user
- [ ] Anonymous session `user_id` matches `auth.uid()` in RLS context (verified with a test insert)
- [ ] Token refresh is handled automatically by the Supabase JS client (no manual refresh code needed)

**Effort:** M
**Layer Dependencies:** BE-01, BE-03

---

## BE-05: Offline Sync Worker

**Title:** Implement the sync queue worker that drains SQLite queue to Supabase

**Description:**
Create `lib/sync.ts`. The sync worker reads pending rows from `syncQueue` (via DB-11 helpers), upserts/deletes them to Supabase using the authenticated client, and marks them done. Uses last-write-wins: `upsert` with `onConflict: "merge"` on the record's `id`. Triggered on network reconnect and app foreground via a NetInfo listener.

**Acceptance Criteria:**
- [ ] `runSync()` drains all pending `syncQueue` rows in `id` asc order
- [ ] `insert` and `update` operations use `supabase.from(table).upsert(payload, { onConflict: "id" })`
- [ ] `delete` operations use `supabase.from(table).delete().eq("id", recordId)`
- [ ] On success, calls `deleteItem(id)` from DB-11
- [ ] On failure, calls `incrementRetry(id, error.message)` and continues to next item (no blocking)
- [ ] Items with `retryCount >= 5` are skipped and flagged (not deleted — requires manual review or future UI)
- [ ] `runSync()` is a no-op when there is no Supabase session or no network
- [ ] NetInfo listener in `lib/sync.ts` calls `runSync()` when connection state changes to `connected`

**Effort:** L
**Layer Dependencies:** BE-04, DB-11 (DB layer)

---

## BE-06: Cloud Backup — Full User Data Export to Supabase

**Title:** Implement full local-to-cloud backup that pushes all SQLite rows to Supabase

**Description:**
Create `lib/backup.ts` with a `runFullBackup(userId)` function. Unlike incremental sync, this reads every row from every synced table and upserts to Supabase. Used on first sign-in after onboarding and as a manual "backup now" action. Provides recovery if the sync queue was partially lost.

**Acceptance Criteria:**
- [ ] `runFullBackup(userId)` upserts all rows from `categories`, `expenses`, `recurringRules`, `incomeRecords`, `profiles` to their Supabase mirrors
- [ ] Uses batched upserts of max 100 rows per request to avoid Supabase payload limits
- [ ] Returns `{ success: boolean, rowsUploaded: number, errors: string[] }`
- [ ] Does not clear the sync queue (incremental sync and full backup are independent paths)
- [ ] Idempotent — running twice produces the same Supabase state (upsert, not insert)
- [ ] Exposed as an exported function only; UI trigger is handled by the frontend layer

**Effort:** M
**Layer Dependencies:** BE-04, BE-05

---

## BE-07: Push Notification Server-Side — Supabase Edge Function for Bill Reminders

**Title:** Create Supabase Edge Function to send recurring bill push reminders

**Description:**
Write `supabase/functions/bill-reminders/index.ts`. This Edge Function queries `recurring_rules` for all active rules where `next_due_date = today + 1 day`, then sends a push notification via Expo's push API for each matching user. Triggered by a Supabase Cron job daily at 09:00 PH time (UTC+8 = 01:00 UTC).

**Acceptance Criteria:**
- [ ] Edge Function queries `recurring_rules` using the service-role client (bypasses RLS to scan all users)
- [ ] For each matching rule, sends a POST to `https://exp.host/--/api/v2/push/send` with the user's Expo push token
- [ ] Expo push tokens stored in `profiles.expoPushToken` (column must be added to BE-02 migration or a follow-on)
- [ ] Notification body: `"[rule.name] is due tomorrow — ₱[rule.amount]"`
- [ ] Cron schedule defined in `supabase/config.toml`: `0 1 * * *` (01:00 UTC = 09:00 PHT)
- [ ] Function returns `{ sent: N, skipped: M }` JSON response
- [ ] Users with null `expoPushToken` are silently skipped (not an error)

**Effort:** L
**Layer Dependencies:** BE-02, BE-03

---

## BE-08: Push Notification Server-Side — Budget Threshold Alerts

**Title:** Create Supabase Edge Function for 80%/100% budget threshold push alerts

**Description:**
Write `supabase/functions/budget-alerts/index.ts`. After each expense sync, re-compute budget utilization per category for the current month. If a category crosses 80% or 100% of its monthly budget for the first time this month, send a push notification. Use a `budget_alerts_sent` table to prevent duplicate alerts within the same month.

**Acceptance Criteria:**
- [ ] Edge Function accepts a `{ userId, month, year }` payload (called by the sync worker after a successful upsert batch)
- [ ] Queries `expenses` and `categories` for the user, computes `spent / monthlyBudget` per category
- [ ] Sends alert if percent crosses 80% or 100% and no alert was sent this month for that category+threshold combination
- [ ] `budget_alerts_sent` table: `(userId, categoryId, threshold, month, year)` unique constraint prevents duplicates
- [ ] Notification body: `"[category] is at [80|100]% of your monthly budget"`
- [ ] Migration adds `budget_alerts_sent` table with RLS enabled
- [ ] Function is invocable via `supabase.functions.invoke("budget-alerts", { body: { ... } })`

**Effort:** L
**Layer Dependencies:** BE-02, BE-03, BE-07

---

## BE-09: Supabase Restore — Pull Cloud Data to SQLite on New Device

**Title:** Implement cloud-to-local restore that pulls Supabase rows into SQLite

**Description:**
Create `lib/restore.ts` with `runRestore(userId)`. This is the complement of `runFullBackup`: on a new device install, after anonymous auth resolves to an existing account (via account upgrade + re-login), pull all Supabase rows into the local SQLite database using Drizzle upserts. Prevents data loss when a user reinstalls or switches devices.

**Acceptance Criteria:**
- [ ] `runRestore(userId)` fetches all rows from each synced Supabase table filtered by `user_id`
- [ ] Fetched rows are upserted into local SQLite via Drizzle (uses DB-08/DB-09/DB-10 helpers or direct `db.insert().onConflictDoUpdate()`)
- [ ] Restore processes tables in dependency order: `categories` before `expenses` (FK safety)
- [ ] Returns `{ success: boolean, rowsRestored: number, errors: string[] }`
- [ ] Does not wipe existing local data before restoring (upsert, not replace)
- [ ] Exposed as exported function only; the onboarding screen triggers it (FE-02)

**Effort:** M
**Layer Dependencies:** BE-04, BE-02
