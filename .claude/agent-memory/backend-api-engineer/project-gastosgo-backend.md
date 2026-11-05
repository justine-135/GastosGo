---
name: project-gastosgo-backend
description: GastosGo backend layer — Supabase setup, auth, sync, edge functions, DB stubs, recurring paymentMethod constraint, date timezone pattern
metadata:
  type: project
---

GastosGo is a React Native (Expo + TypeScript) personal finance app for Philippine users. Backend uses Supabase (Postgres + Auth + Edge Functions); local layer uses SQLite via Drizzle ORM.

**Why:** BE tasks were implemented from scratch on a greenfield repo (no package.json, no source files existed).

**Implemented files:**
- `lib/supabase.ts` — singleton client with AsyncStorage session adapter
- `lib/auth.ts` — `signInAnonymously()` + `upgradeAccount()`
- `lib/sync.ts` — sync queue worker with NetInfo listener; depends on DB-11 (`db/queries/syncQueue.ts`)
- `lib/backup.ts` — full upsert backup to Supabase; depends on `db/queries/backup.ts` (DB-08/09/10)
- `lib/restore.ts` — cloud-to-local restore via Drizzle upsert; depends on `db/queries/{table}.ts`
- `supabase/migrations/20240001000000_initial_schema.sql` — all mirror tables + RLS policies + `budget_alerts_sent`
- `supabase/functions/bill-reminders/index.ts` — daily cron push for recurring rules due tomorrow
- `supabase/functions/budget-alerts/index.ts` — 80%/100% budget threshold alerts, dedup via unique constraint
- `supabase/config.toml` — cron schedule `0 1 * * *` for bill-reminders
- `.env.local` / `.env.example` — placeholder env vars (never commit `.env.local`)

**Key design decisions:**
- Anonymous auth first — `signInAnonymously()` is idempotent (checks existing session first)
- Sync is last-write-wins via `upsert({ onConflict: "id" })`; retries capped at 5 before manual review
- Budget alert dedup uses Postgres unique constraint on `(user_id, category_id, threshold, month, year)` — no separate check query needed
- `SUPABASE_SERVICE_ROLE_KEY` is used only in Edge Functions server-side; anon key in app bundle
- `profiles.expo_push_token` column added to migration for push notification support

**DB-layer stubs:** `lib/sync.ts`, `lib/backup.ts`, and `lib/restore.ts` all dynamically `require()` DB helpers so they compile before DB tasks are complete. Each has `// shortcut: DB-11 not yet implemented` comments.

**How to apply:** When asked to build on these files, check that DB-11 (`db/queries/syncQueue.ts`) exists before removing the dynamic-require stubs in `lib/sync.ts`.

---

**Schema constraint — recurringRulesTable has no paymentMethod column (as of 2026-11-05):** `rowToRecurringRule` in `lib/db/stubs.ts` accepts `paymentMethod` as a second parameter (default `'Cash'`). `insertRecurringRule` passes `input.paymentMethod`; `updateRecurringRule` passes `input.paymentMethod ?? 'Cash'`. Upgrade: db agent adds the column, remove the parameter, read from row.

**Date storage convention:** Dates stored as YYYY-MM-DD local date strings. Always use `new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]` — never `.toISOString().split('T')[0]` alone (that's UTC and causes off-by-one for PST before 8am).

**Modal file locations:** `app/modals/add-expense.tsx` and `app/modals/add-recurring.tsx` (not at the app root).

**Restore flow:** `lib/restore.ts` dynamically requires `lib/db/queries/restore.ts` (not yet implemented). It returns `{ success: false, errors: [...] }` when missing — does NOT throw. The onboarding caller (`app/onboarding/index.tsx`) now surfaces the result/error to the user via `restoreMsg` state instead of swallowing it with `.catch(console.warn)`.

---

**Local user identity (TASK-BE-01):** `LOCAL_USER_ID = 'local-user'` exported from `lib/constants.ts`. All hooks and DB write functions import this constant — never hardcode `'stub-user-001'` or `'local-user'` directly. The read-path previously used `'stub-user-001'` while `insertProfile` used `'local-user'`, causing every user-scoped query to return empty. Single constant is the future auth swap point.
