---
name: bug-ledger
description: Persistent record of every bug seen in GastosGo, its fix attempts, and confirmed root cause. Read before fixing; write after fixing.
metadata:
  type: project
---

# GastosGo Bug Ledger

Before fixing any bug, read the relevant entry. If Status is `recurred` and your proposed fix matches a prior attempt, **stop — find the root cause instead.**

---

## BUG-01 — Lock screen redirect race on cold start

**First seen:** 2026-11-05  
**Status:** fixed (2026-11-06)  
**Attempts:** Guard added in `app/_layout.tsx`: redirect only fires when `navState?.key` is truthy  
**Root cause:** `router.replace('/lock')` fired before the navigator was mounted.  
**Files touched:** `app/_layout.tsx`  
**Notes:** Fix confirmed in code review — `useEffect` on `navState?.key` defers redirect until navigator ready.

---

## BUG-02 — PIN length mismatch locks users out permanently

**First seen:** 2026-11-05  
**Status:** fixed (2026-11-06)  
**Attempts:** Both `app/onboarding/pin-setup.tsx` and `app/lock.tsx` aligned to 6-digit PIN  
**Root cause:** Onboarding wrote 6-digit PIN hash; lock screen submitted at 4 digits — hashes never matched.  
**Files touched:** `app/onboarding/pin-setup.tsx`, `app/lock.tsx`  
**Notes:** Both files confirmed using 6-digit logic consistently.

---

## BUG-05 — All data reads return empty (userId mismatch)

**First seen:** 2026-11-05  
**Status:** fixed (2026-11-06)  
**Attempts:** `lib/db/stubs.ts` now imports and uses `LOCAL_USER_ID = 'local-user'` from `lib/constants.ts`  
**Root cause:** Hooks used `USER_ID = 'stub-user-001'`; `insertProfile` wrote `userId = 'local-user'`. Constant mismatch.  
**Files touched:** `lib/db/stubs.ts`, `lib/constants.ts`  
**Notes:** Single constant `LOCAL_USER_ID` now used everywhere.

---

## BUG-07 — Recurring rules always show Cash payment method

**First seen:** 2026-11-05  
**Status:** open — shortcut documented  
**Attempts:** _(none — shortcut comment added in stubs.ts)_  
**Root cause:** `recurringRulesTable` schema has no `paymentMethod` column; value defaults to 'Cash' in `rowToRecurringRule`.  
**Files touched:** `lib/db/stubs.ts` (shortcut comment at line 366)  
**Notes:** `insertRecurringRule` accepts `paymentMethod` in input and passes it through in-memory, but `updateRecurringRule` falls back to 'Cash'. Schema migration needed. UI correctly shows payment method selector — it just won't persist across reloads.

---

## BUG-16 — Budgets always empty on fresh install

**First seen:** 2026-11-05  
**Status:** recurred (2026-11-06, session 2)  
**Attempts:**  
  1. (2026-11-06 session 1) `getBudgetProgress` claimed to use `or(eq(...), isNull(...))` — but code at line 306 of `lib/db/stubs.ts` still reads `eq(categoriesTable.userId, userId)`. The fix was never applied or was reverted.  
**Root cause:** `getBudgetProgress` WHERE clause filters seeded default categories (userId=NULL) out. All seed categories have NULL userId; `LOCAL_USER_ID` is `'local-user'` so the eq() matches nothing.  
**Files touched:** `lib/db/stubs.ts` (line 306 — WHERE clause needs `or(eq..., isNull(...))`)  
**Notes:** Also need same fix in `getMonthlyExpenseSummary` (line 533) and `getMultiMonthSummary` (line 585) — see BUG-25. The prior "fix confirmed" note was incorrect — fix was not in the code.

---

## BUG-17 — Biometrics skip despite being enabled

**First seen:** 2026-11-05  
**Status:** fixed (2026-11-06)  
**Attempts:** `tryBiometric()` in `app/lock.tsx` now reads `gastosgo-biometrics-enabled` before prompting  
**Root cause:** `gastosgo-biometrics-enabled` flag written during onboarding but never read by lock screen.  
**Files touched:** `app/lock.tsx`  
**Notes:** Fix confirmed at lines 98-99.

---

## BUG-22 — "Today"/"Yesterday" labels wrong between midnight–8am

**First seen:** 2026-11-05  
**Status:** fixed (2026-11-06)  
**Attempts:** `formatDate` in `utils/format.ts` now uses timezone-offset-adjusted local date strings for comparison  
**Root cause:** `formatDate` compared ISO strings directly, treating them as UTC — off by 8 hours overnight.  
**Files touched:** `utils/format.ts`  
**Notes:** Fix confirmed at lines 32-35. Both today and yesterday checks now use local timezone.

---

## BUG-23 — MonthNavigator allows infinite future browsing

**First seen:** 2026-11-05  
**Status:** fixed (2026-11-06)  
**Attempts:** `MonthNavigator.tsx` disables next button when current display month >= today's month  
**Root cause:** No upper-bound cap on the month the navigator could advance to.  
**Files touched:** `components/MonthNavigator.tsx`  
**Notes:** Fix confirmed at lines 22-24 and 42-47. Button is disabled and dimmed.

---

## BUG-24 — New category not shown until modal reopen

**First seen:** 2026-11-05  
**Status:** fixed (2026-11-06)  
**Attempts:** `handleAddCategory` in `add-expense.tsx` calls `qc.invalidateQueries({ queryKey: ['categories'] })` after insert  
**Root cause:** `handleAddCategory` did not invalidate the categories query after inserting.  
**Files touched:** `app/modals/add-expense.tsx`  
**Notes:** Fix confirmed at line 105.

---

## BUG-25 — 6-month bar chart always shows zero budget bars

**First seen:** 2026-11-06  
**Status:** open  
**Attempts:** _(none)_  
**Root cause:** `getMonthlyExpenseSummary` and `getMultiMonthSummary` in `lib/db/stubs.ts` query categories budget with `eq(categoriesTable.userId, userId)`, but `insertCategory` always writes `userId: null`. All categories have NULL userId so budget sum returns 0.  
**Files touched:** `lib/db/stubs.ts` (lines 533, 585)  
**Notes:** `getBudgetProgress` correctly handles this with `or(eq..., isNull(...))` — same fix needed in `getMonthlyExpenseSummary`/`getMultiMonthSummary`. Also: user-created categories via add-expense modal also get `userId: null` (line 142), which is inconsistent with expense rows using `LOCAL_USER_ID`.

---

## BUG-26 — User-created categories get userId: null (budget attribution gap)

**First seen:** 2026-11-06  
**Status:** open  
**Attempts:** _(none)_  
**Root cause:** `insertCategory` in `lib/db/stubs.ts` (line 142) hardcodes `userId: null`. This means user-created categories behave identically to seeded default categories — they're "global" with no user attribution. If multi-user support is ever added, all custom categories will be shared/visible across users.  
**Files touched:** `lib/db/stubs.ts`  
**Notes:** Acceptable as a shortcut for single-user local-first build, but should be documented. For now it means custom categories always appear in budgets (the NULL guard handles it), but the gap is that `getMonthlyExpenseSummary` misses them (BUG-25).

---

## BUG-27 — `local-user` row never inserted in `users` table before FK-dependent inserts

**First seen:** 2026-11-06  
**Status:** open  
**Attempts:** _(none)_  
**Root cause:** `profiles`, `expenses`, `recurring_rules`, and `income_records` all have `userId` FKs referencing `users.id`. `LOCAL_USER_ID = 'local-user'` is used everywhere, but nowhere (not in `runMigrations`, `seed.ts`, or `insertProfile`) is a `users` row with `id = 'local-user'` inserted first. SQLite FK enforcement is OFF (no `PRAGMA foreign_keys = ON` in `db/client.ts`), so this silently works today, but any future `PRAGMA` activation (or test with FK on) will cause cascading FK violations on every insert.  
**Files touched:** `db/seed.ts` or `db/migrate.ts` (need to insert local-user row); `db/client.ts` (FK pragma decision)  
**Notes:** Currently non-crashing because SQLite FK enforcement is off by default. Risk escalates if FK enforcement is ever enabled — all onboarding writes will fail.

---

## BUG-28 — `monthlySalary` entered during onboarding is silently discarded

**First seen:** 2026-11-06  
**Status:** open  
**Attempts:** _(none)_  
**Root cause:** `profiles` schema has no `monthly_salary` column. `InsertProfileInput.monthlySalary` is accepted by `insertProfile` but never written to the DB (no matching column in the INSERT). `rowToProfile` stubs `monthlySalary: null` permanently. The savings gap widget falls back to `profile?.monthlySalary ?? 0` — always 0 — so "Total Spent" and "Savings Gap" on the dashboard are correct only if the user also records income via `income_records`. For pure salary users who complete onboarding, their salary is lost.  
**Files touched:** `lib/db/stubs.ts` (`insertProfile`), `db/schema/profiles.ts` (missing column), `drizzle/` (migration needed)  
**Notes:** Affects the core value proposition — savings gap will always show 0 income for salary-mode users. Medium-to-high severity.

---

## BUG-29 — `useMarkRuleAsPaid` date uses `new Date().toISOString().split('T')[0]` (UTC, not local)

**First seen:** 2026-11-06  
**Status:** open  
**Attempts:** _(none)_  
**Root cause:** In `hooks/useRecurring.ts` line 74, the expense date when marking a recurring rule paid is `new Date().toISOString().split('T')[0]` — this is UTC midnight, which is the previous calendar day for users east of UTC (Philippines is UTC+8). The add-expense modal correctly uses `new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().split('T')[0]` to get local date; `useMarkRuleAsPaid` skips this correction.  
**Files touched:** `hooks/useRecurring.ts` (line 74)  
**Notes:** Same root cause as BUG-22 (now fixed in formatDate). Same one-liner fix: subtract `timezoneOffset * 60000` before splitting.
