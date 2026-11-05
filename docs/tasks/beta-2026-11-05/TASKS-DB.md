# GastosGo — Database Tasks
**Generated from:** docs/bugs/bugs.md  
**Date:** 2026-11-05  
**Assignee agent:** db-schema-engineer

---

## TASK-DB-01 — Install `drizzle-orm`, `expo-sqlite`, and `drizzle-kit`
**Bug ref:** BUG-01  
**Severity:** Critical  
**File:** `package.json`  
**What to do:** Add `drizzle-orm`, `expo-sqlite`, and `drizzle-kit` to `package.json`. Run `npm install --legacy-peer-deps` (required until BUG-02 / `.npmrc` fix lands). Confirm all 15 `TS2307: Cannot find module 'drizzle-orm'` errors are resolved. Check the `victory-native` peer-dep constraint — pin to a React 18 / RN 0.76 compatible version if needed to avoid install failure.  
**Acceptance criteria:**
- `npm install` resolves without errors after adding the packages.
- Zero `TS2307: Cannot find module 'drizzle-orm'` TypeScript errors remain across `db/`.
- `npx drizzle-kit` runs without errors.
- `expo-sqlite` is importable in the app without Metro crashing.

---

## TASK-DB-02 — Fix Metro crash: hoist `expo-asset` and sync Expo 52 lockfile
**Bug ref:** INSTALL-01  
**Severity:** Critical  
**File:** `package.json`, `package-lock.json`  
**What to do:** Add `expo-asset` as a direct dependency (`npm install expo-asset --legacy-peer-deps`) so it is hoisted to `node_modules/` and `@expo/metro-config` can `require('expo-asset/tools/hashAssetFiles')` without crashing. While touching `package.json`, also align `expo-crypto`, `react-native-screens`, and `@react-native-async-storage` to their Expo 52 SDK-compatible versions to clear the non-fatal version-mismatch warnings and bring the lockfile back in sync.  
**Acceptance criteria:**
- `npx expo start` (fresh install, no prior `node_modules`) exits the Metro bundler startup without a crash.
- No `Cannot find module 'expo-asset/tools/hashAssetFiles'` error in Metro output.
- Version-mismatch warnings for `expo-crypto`, `react-native-screens`, and `@react-native-async-storage` are gone.
- `package-lock.json` is consistent with `package.json` (no `npm install` drift warnings).

---

## TASK-DB-03 — Wire real Drizzle + SQLite queries to replace in-memory stubs
**Bug ref:** BUG-04  
**Severity:** High  
**File:** `lib/db/stubs.ts`  
**What to do:** Replace every stub in `lib/db/stubs.ts` (`insertExpense`, `updateCategory`, `insertRecurringRule`, and all other write/read operations) with real Drizzle ORM queries against the `expo-sqlite` database. Ensure the offline-first requirement is met: all writes persist to the local SQLite file and survive an app restart.  
**Acceptance criteria:**
- Inserting an expense and restarting the app shows the expense on the list.
- Updating a category persists across restarts.
- Inserting a recurring rule persists across restarts.
- No stub function in `lib/db/stubs.ts` returns fake/hardcoded data for any user-facing write operation.
- Drizzle migrations run on first launch without errors.

**Blocked by:** TASK-DB-01 (drizzle-orm / expo-sqlite must be installed first).

---

## TASK-DB-04 — Reduce Insights screen from 18 DB calls to a single aggregated query
**Bug ref:** BUG-13  
**Severity:** Medium  
**File:** `lib/db/stubs.ts:297`  
**What to do:** Refactor `getMonthlyExpenseSummary` so it does not call `getBudgetProgress` → `getExpensesByMonth` per month. Instead, fetch all 6 months of expense rows in one query, group and sum in memory (or via a single SQL `GROUP BY month` query), and pass the pre-aggregated totals into the budget-progress calculation without re-fetching expenses.  
**Acceptance criteria:**
- Loading the 6-month bar chart on the Insights screen issues at most 2 DB queries (one for expenses, one for budget limits), not 18.
- Displayed totals are identical to the previous per-month calculation.
- No regression on the Insights screen when fewer than 6 months of data exist.

**Blocked by:** TASK-DB-03 (real queries must be wired before the optimization is meaningful).
