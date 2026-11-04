# GastosGo — Database Tasks (SQLite + Drizzle ORM)

Layer: **DB**
All tasks target `gastosgo/db/` and are independent of one another. Frontend and Backend layers depend on these.

---

## DB-01: Drizzle ORM Project Setup

**Title:** Install and configure Drizzle ORM with Expo SQLite driver

**Description:**
Install `drizzle-orm`, `drizzle-kit`, and the `expo-sqlite` Drizzle adapter. Configure `drizzle.config.ts` pointing at the local SQLite file. Set up `db/client.ts` that opens the SQLite database via `expo-sqlite` and exports the typed `db` instance for use across the app.

**Acceptance Criteria:**
- [ ] `drizzle-orm`, `drizzle-kit`, `expo-sqlite` are listed in `package.json`
- [ ] `drizzle.config.ts` exists at repo root with correct `dialect: "sqlite"` and `schema` path
- [ ] `db/client.ts` exports a singleton `db` using `drizzle(openDatabaseSync("gastosgo.db"))`
- [ ] `npx drizzle-kit generate` runs without error on an empty schema

**Effort:** S
**Layer Dependencies:** None

---

## DB-02: Core Schema — Users, Profiles, Categories

**Title:** Define Drizzle schema for `users`, `profiles`, and `categories` tables

**Description:**
Create `db/schema/users.ts`, `db/schema/profiles.ts`, and `db/schema/categories.ts` using Drizzle's SQLite table helpers. `profiles` holds income mode (`salary | mixed | target`), savings target, and budget cycle start day. `categories` holds name, icon, color, monthly budget, and currency. All tables use UUID primary keys (text).

**Acceptance Criteria:**
- [ ] `usersTable` has `id` (text PK), `supabaseId` (text, nullable), `createdAt`
- [ ] `profilesTable` has `userId` (FK → users), `incomeMode` (text), `savingsTarget` (real), `budgetCycleStart` (integer 1–28), `currency` (text, default `"PHP"`)
- [ ] `categoriesTable` has `id`, `userId` (FK), `name`, `icon`, `color`, `monthlyBudget` (real), `currency`, `createdAt`, `updatedAt`
- [ ] All relations exported from `db/schema/relations.ts`
- [ ] `npx drizzle-kit generate` produces a valid migration file

**Effort:** M
**Layer Dependencies:** DB-01

---

## DB-03: Core Schema — Expenses

**Title:** Define Drizzle schema for `expenses` table

**Description:**
Create `db/schema/expenses.ts`. Expenses are the central entity: amount, categoryId (FK → categories), merchant (text, nullable), notes (text, nullable), paymentMethod (text), date (text ISO-8601), isRecurring (integer boolean), recurringRuleId (text, nullable FK → recurringRules), syncedAt (text, nullable), currency (text).

**Acceptance Criteria:**
- [ ] `expensesTable` has all fields listed above with correct SQLite types
- [ ] `categoryId` is a foreign key with `onDelete: "set null"`
- [ ] `recurringRuleId` is nullable FK; no hard cascade (recurring rule deletion must not wipe expense history)
- [ ] `date` stored as ISO-8601 text; a check constraint enforces `length(date) >= 10`
- [ ] `syncedAt` nullable text — null means unsynced
- [ ] Migration file generated without error

**Effort:** M
**Layer Dependencies:** DB-01, DB-02

---

## DB-04: Core Schema — Recurring Rules and Income Records

**Title:** Define Drizzle schema for `recurringRules` and `incomeRecords` tables

**Description:**
Create `db/schema/recurringRules.ts` and `db/schema/incomeRecords.ts`. `recurringRules` drives push reminders and auto-generated expense entries. `incomeRecords` supports all three income modes (salary, mixed, target) with source label, month, and year.

**Acceptance Criteria:**
- [ ] `recurringRulesTable`: `id`, `userId` (FK), `name`, `amount` (real), `categoryId` (FK nullable), `frequency` (text: `daily | weekly | monthly | yearly`), `nextDueDate` (text ISO-8601), `isActive` (integer boolean, default 1), `createdAt`, `updatedAt`
- [ ] `incomeRecordsTable`: `id`, `userId` (FK), `amount` (real), `source` (text), `month` (integer 1–12), `year` (integer), `createdAt`
- [ ] Unique constraint on `incomeRecords(userId, source, month, year)` to prevent duplicates
- [ ] Migration file generated without error

**Effort:** M
**Layer Dependencies:** DB-01, DB-02

---

## DB-05: Core Schema — Sync Queue

**Title:** Define Drizzle schema for `syncQueue` table

**Description:**
Create `db/schema/syncQueue.ts`. The sync queue is the offline-first mechanism: every local write that needs to reach Supabase appends a row here. The sync worker drains it in order. Supports `insert`, `update`, `delete` operations across all synced tables.

**Acceptance Criteria:**
- [ ] `syncQueueTable`: `id` (integer PK autoincrement), `operation` (text: `insert | update | delete`), `tableName` (text), `recordId` (text), `payload` (text — JSON stringified), `createdAt` (text ISO-8601), `retryCount` (integer default 0), `lastError` (text nullable)
- [ ] `retryCount` and `lastError` allow the sync worker (BE-05) to handle transient failures without data loss
- [ ] Migration file generated without error
- [ ] `createdAt` indexed for ordered draining

**Effort:** S
**Layer Dependencies:** DB-01

---

## DB-06: Migration Runner Integration

**Title:** Integrate Drizzle migrations into app startup

**Description:**
Create `db/migrate.ts` that calls `migrate(db, migrations)` using the `expo-sqlite` migration helper from `drizzle-orm/expo-sqlite`. Hook this into the app root so migrations run on every cold start before any screen renders. This ensures schema is always up to date on device without manual intervention.

**Acceptance Criteria:**
- [ ] `db/migrate.ts` runs all pending migrations synchronously before the first render
- [ ] App does not crash if `migrations/` folder has zero pending files
- [ ] Error during migration surfaces as a visible error boundary (not a silent crash)
- [ ] A test migration (add/drop a dummy column) round-trips successfully in the Expo Go simulator

**Effort:** M
**Layer Dependencies:** DB-01, DB-02, DB-03, DB-04, DB-05

---

## DB-07: Seed Data — Default Categories

**Title:** Create seed script for default expense categories

**Description:**
Write `db/seed.ts` that inserts the default category set for a new user (Food, Transport, Shopping, Bills, Entertainment, Health, Savings, Others) with Filipino-relevant icons and pastel colors matching the app theme. Seed runs only if the categories table is empty for the user, making it idempotent.

**Acceptance Criteria:**
- [ ] 8 default categories defined with `id`, `name`, `icon` (emoji or icon key), `color` (hex pastel), `monthlyBudget: 0` (user sets their own), `currency: "PHP"`
- [ ] Seed function is idempotent — running twice does not create duplicates
- [ ] Seed is called from `db/migrate.ts` after migrations complete
- [ ] Default categories are visible in the app immediately after first install (no network required)

**Effort:** S
**Layer Dependencies:** DB-02, DB-06

---

## DB-08: Drizzle Query Helpers — Expenses

**Title:** Write typed Drizzle query helpers for expense CRUD and filtered reads

**Description:**
Create `db/queries/expenses.ts` exposing typed helper functions used by the Zustand store and TanStack Query hooks. Covers the most frequent read patterns: expenses by month/year, by category, by date range, and the recent-N query for the dashboard.

**Acceptance Criteria:**
- [ ] `insertExpense(data)` — inserts and returns the new row
- [ ] `updateExpense(id, patch)` — partial update by id
- [ ] `deleteExpense(id)` — hard delete
- [ ] `getExpensesByMonth(userId, month, year)` — returns all expenses for given month
- [ ] `getExpensesByCategory(userId, categoryId, month, year)` — for budget progress
- [ ] `getRecentExpenses(userId, limit)` — ordered by date desc, used by dashboard
- [ ] All functions are typed via Drizzle's inferred select/insert types (no `any`)

**Effort:** M
**Layer Dependencies:** DB-02, DB-03

---

## DB-09: Drizzle Query Helpers — Budgets and Savings

**Title:** Write typed Drizzle query helpers for budget progress and savings calculations

**Description:**
Create `db/queries/budgets.ts` and `db/queries/savings.ts`. Budget queries aggregate expenses per category against the monthly budget limit. Savings queries join income records with total monthly spend to compute expected vs actual savings gap — the core value of the savings tracker feature.

**Acceptance Criteria:**
- [ ] `getBudgetProgress(userId, month, year)` returns `{ categoryId, categoryName, budget, spent, percent }[]`
- [ ] `getSavingsGap(userId, month, year)` returns `{ totalIncome, totalSpent, expectedSavings, actualSavings, gap }`
- [ ] Queries use Drizzle's `sum()` aggregate, not in-memory reduce
- [ ] Both functions handle months with zero expenses (return zeros, not null/undefined)
- [ ] Types fully inferred — no raw SQL strings

**Effort:** M
**Layer Dependencies:** DB-02, DB-03, DB-04

---

## DB-10: Drizzle Query Helpers — Recurring Rules

**Title:** Write typed Drizzle query helpers for recurring rule management

**Description:**
Create `db/queries/recurringRules.ts`. The key read is "rules due within N days" which drives push notification scheduling and the dashboard "upcoming bills" widget. Also includes CRUD and a helper to advance `nextDueDate` after a rule is marked paid.

**Acceptance Criteria:**
- [ ] `getRulesDueWithin(userId, days)` returns active rules where `nextDueDate <= today + days`
- [ ] `insertRecurringRule(data)` — creates rule and returns typed row
- [ ] `updateRecurringRule(id, patch)` — partial update
- [ ] `deactivateRule(id)` — sets `isActive = 0`
- [ ] `advanceNextDueDate(id)` — increments `nextDueDate` by the rule's frequency (e.g., +1 month for `monthly`)
- [ ] Edge case: `advanceNextDueDate` for `monthly` on day 31 of a short month snaps to last day of next month

**Effort:** M
**Layer Dependencies:** DB-04

---

## DB-11: Drizzle Query Helpers — Sync Queue

**Title:** Write typed Drizzle query helpers for sync queue operations

**Description:**
Create `db/queries/syncQueue.ts`. The sync worker (BE-05) calls these to drain the queue. Helpers must support atomic dequeue-and-delete patterns and increment retry counts on failure.

**Acceptance Criteria:**
- [ ] `enqueue(operation, tableName, recordId, payload)` — appends a row in order
- [ ] `getPendingItems(limit)` — returns oldest N unprocessed rows ordered by `id` asc
- [ ] `deleteItem(id)` — removes successfully synced row
- [ ] `incrementRetry(id, error)` — bumps `retryCount` and sets `lastError`
- [ ] `getPendingCount()` — returns integer count for UI badge / status indicator
- [ ] No item is silently dropped; every failure path updates `lastError`

**Effort:** S
**Layer Dependencies:** DB-05
