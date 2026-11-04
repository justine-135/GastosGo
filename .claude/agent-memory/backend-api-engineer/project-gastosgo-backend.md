---
name: project-gastosgo-backend
description: GastosGo backend layer — Supabase setup, auth pattern, sync architecture, edge functions, and DB-layer stubs
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
