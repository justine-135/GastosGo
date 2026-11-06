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
**Status:** fixed (2026-11-06)  
**Attempts:** `getBudgetProgress` now uses `or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId))`  
**Root cause:** `getBudgetProgress` filtered by userId but seeded default categories had `userId = NULL`.  
**Files touched:** `lib/db/stubs.ts`  
**Notes:** Fix confirmed in code review.

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
