---
name: project-gastosgo-db
description: GastosGo database layer: engine, conventions, schema summary, migration numbering, sensitive data policy
metadata:
  type: project
---

GastosGo is a Filipino personal expense tracking app (Expo + TypeScript + expo-sqlite + Drizzle ORM).

**Engine:** SQLite via expo-sqlite (not PostgreSQL — no TIMESTAMPTZ, no CONCURRENTLY indexes, no NUMERIC type).

**Migration numbering:** Sequential Drizzle-kit auto-generated filenames in `drizzle/` folder. First migration is `0000_true_radioactive_man.sql`. Run `npm run db:generate` to produce new migrations.

**Config:** `drizzle.config.ts` — dialect: sqlite, driver: expo, schema: `./db/schema/index.ts`, out: `./drizzle`.

**Money columns:** Use `real` (SQLite has no DECIMAL/NUMERIC). This is a known limitation of SQLite — for financial precision, application layer must round to 2dp.

**Timestamps:** `text` ISO-8601 via `strftime('%Y-%m-%dT%H:%M:%fZ', 'now')` default. No TIMESTAMPTZ available in SQLite.

**UUIDs:** `crypto.randomUUID()` — Expo supports it.

**Table naming:** snake_case plural (users, profiles, categories, expenses, recurring_rules, income_records, sync_queue).

**Soft deletes:** Not implemented — hard deletes only. Add `deleted_at text` column if needed later.

**Multi-tenancy:** userId FK on every user-owned table. Categories also support null userId for system-default categories.

**Sensitive columns:**
- `users.supabase_id` — external auth ID, do not log or expose in API responses
- `expenses.amount`, `income_records.amount` — financial data
- `profiles.savings_target` — financial data

**Seed:** `db/seed.ts` seeds 8 default categories (null userId = global) idempotently via `onConflictDoNothing()`.

**Migrate runner:** `db/migrate.ts` exports `runMigrations()` — calls `migrate()` then `seedDefaultCategories()`. Consumer must call before first render; throws on failure (not silenced).

**babel/metro:** `babel.config.js` has `inline-import` plugin for `.sql`; `metro.config.js` pushes `sql` to sourceExts. Required for Drizzle expo migrations to bundle correctly.

**Why:** React Native / Expo app needs local-first SQLite database with offline sync queue for future Supabase sync.
**How to apply:** Always use `real` not `numeric` for money, `text` not `timestamptz` for dates, and check SQLite-specific limitations before recommending PostgreSQL patterns.
