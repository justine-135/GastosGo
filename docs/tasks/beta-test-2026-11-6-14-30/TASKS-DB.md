# TASKS-DB.md — Database Schema & Migrations
**Target agent:** `db-schema-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-06-1430.md`
**Date:** 2026-11-06

---

## TASK-DB-01: Add monthly_salary column to profiles table

**Bug ref:** BUG-28
**Priority:** P1
**Type:** BUG
**Files touched:** `db/schema/profiles.ts`, `drizzle/` (new migration file)

### What's broken
`profilesTable` has no `monthly_salary` column. The `InsertProfileInput` type carries `monthlySalary` and the onboarding screen passes a value, but `insertProfile` has nowhere to persist it. `rowToProfile` hardcodes `monthlySalary: null`. Savings Gap always shows ₱0 income.

### Reproduction steps
1. Run `SELECT * FROM profiles;` after onboarding with a salary entered.
2. No `monthly_salary` column exists; salary value is lost.

### Acceptance criteria
- [ ] `profilesTable` in `db/schema/profiles.ts` includes `monthlySalary: real('monthly_salary')` (nullable, no default — null means "not set").
- [ ] A Drizzle migration is generated and committed under `drizzle/`.
- [ ] Existing profile rows are unaffected (column nullable, no backfill required).
- [ ] `db/schema/index.ts` re-exports any new type if needed.

### Technical notes
Add to `profilesTable`:
```ts
monthlySalary: real('monthly_salary'),
```
Nullable real is the correct type — `0` and `null` are distinct ("user earns zero" vs "not set"). No default is safer than defaulting to 0, which would silently suppress the getSavingsGap fallback.

After schema edit, run:
```
npx drizzle-kit generate
```
to produce the migration SQL.

### Dependencies
None — parallel-safe. TASK-BE-03 is blocked by this task.

---

## TASK-DB-02: Add payment_method column to recurring_rules table

**Bug ref:** BUG-07
**Priority:** P3
**Type:** BUG
**Files touched:** `db/schema/recurringRules.ts`, `drizzle/` (new migration file)

### What's broken
`recurringRulesTable` has no `payment_method` column. When a rule is saved with GCash or Card and the app is reloaded, the value is lost and the UI reverts to "Cash" (the in-memory default). The column was present in the original design but was never added to the Drizzle schema.

### Reproduction steps
1. Add a recurring rule, select GCash as payment method.
2. Reload the app.
3. Rule shows "Cash" payment method.

### Acceptance criteria
- [ ] `recurringRulesTable` includes a `paymentMethod` column with the same enum values used by `expensesTable` (`cash`, `gcash`, `card`, `bank_transfer`).
- [ ] Column defaults to `'cash'` so existing rows remain valid.
- [ ] A migration is generated under `drizzle/`.
- [ ] The insert/update logic in `lib/db/stubs.ts` for recurring rules can be updated by TASK-BE to persist the value (this task only owns the schema).

### Technical notes
Check `db/schema/expenses.ts` for the exact enum definition and reuse it in `recurringRulesTable`:
```ts
paymentMethod: text('payment_method', {
  enum: ['cash', 'gcash', 'card', 'bank_transfer'],
}).notNull().default('cash'),
```
Run `npx drizzle-kit generate` after the schema edit.

### Dependencies
None — parallel-safe.

---

## TASK-DB-03: Insert local-user row in users table during DB init / seed

**Bug ref:** BUG-27
**Priority:** P2
**Type:** BUG
**Files touched:** `db/seed.ts`, `db/migrate.ts`

### What's broken
`seedDefaultCategories` inserts categories but never inserts the `local-user` row into `usersTable`. `insertProfile` hardcodes `userId = LOCAL_USER_ID` and assumes the row exists. FK enforcement is currently off (`PRAGMA foreign_keys = OFF`) so this is silent — but enabling it would cause `insertProfile` to throw a FK constraint violation on first profile insert.

### Reproduction steps
1. Enable FK enforcement (`PRAGMA foreign_keys = ON` in db client).
2. Fresh install → complete onboarding.
3. App throws FK constraint error on profile insert.

### Acceptance criteria
- [ ] `seedDefaultCategories` (or a new `seedLocalUser` called from `runMigrations`) inserts a row into `usersTable` with `id = LOCAL_USER_ID` using `onConflictDoNothing`.
- [ ] `runMigrations` calls this seed before `seedDefaultCategories` (FK order: user row must exist before category rows that might reference it).
- [ ] The app still boots cleanly on existing installs (idempotent via `onConflictDoNothing`).

### Technical notes
`LOCAL_USER_ID` is exported from `lib/constants.ts`. Import it in `db/seed.ts`:
```ts
import { usersTable } from './schema';
import { LOCAL_USER_ID } from '../lib/constants';

export async function seedLocalUser(): Promise<void> {
  await db.insert(usersTable).values({ id: LOCAL_USER_ID }).onConflictDoNothing();
}
```
Then in `db/migrate.ts`, call `seedLocalUser()` before `seedDefaultCategories()`.

This is a seed-only change — no migration SQL needed unless you want to enforce FK at the DB level now (do not; that is a separate decision).

### Dependencies
None — parallel-safe. No schema file changes, so no migration generation required.
