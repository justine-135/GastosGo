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
**Status:** fixed (2026-11-10, session 4)  
**Attempts:** `db/seed.ts` exports `seedLocalUser()` which does `INSERT OR IGNORE INTO users (id) VALUES ('local-user')`. `db/migrate.ts` `runMigrations()` calls `seedLocalUser()` on every launch.  
**Root cause:** Was never inserting the `local-user` row; SQLite FK enforcement is off so it was silent.  
**Files touched:** `db/seed.ts`, `db/migrate.ts`  
**Notes:** Confirmed fixed — `runMigrations()` calls `seedLocalUser()` before `seedDefaultCategories()`.

---

## BUG-28 — `monthlySalary` entered during onboarding is silently discarded

**First seen:** 2026-11-06  
**Status:** fixed (2026-11-10, session 4)  
**Attempts:** `insertProfile` in `lib/db/stubs.ts` now writes `monthlySalary: input.monthlySalary ?? null` (line 87). `rowToProfile` returns `row.monthlySalary ?? null` (line 60). Column exists in profiles schema.  
**Root cause:** Was: schema lacked `monthly_salary` column; now present.  
**Files touched:** `lib/db/stubs.ts`, `db/schema/profiles.ts`, `drizzle/` migrations  
**Notes:** Confirmed fixed in current code.

---

## BUG-29 — `useMarkRuleAsPaid` date uses `new Date().toISOString().split('T')[0]` (UTC, not local)

**First seen:** 2026-11-06  
**Status:** fixed (2026-11-06, session 3)  
**Attempts:** `hooks/useRecurring.ts` line 74 now uses local date components (`getFullYear`, `getMonth+1`, `getDate` with zero-padding) — no longer uses `toISOString()`.  
**Root cause:** Was using UTC ISO string; fixed to use local date components.  
**Files touched:** `hooks/useRecurring.ts`  
**Notes:** Confirmed in code — IIFE at line 74 uses `now.getFullYear()`, `now.getMonth() + 1`, `now.getDate()`.

---

## BUG-30 — `recurringRulesTable` schema paymentMethod enum mismatches UI type

**First seen:** 2026-11-06  
**Status:** open (schema mismatch persists — SQLite doesn't enforce enums, so no crash, but Supabase sync risk remains)  
**Attempts:** _(none on schema)_  
**Root cause:** `db/schema/recurringRules.ts` declares enum as `["cash", "gcash", "card", "bank_transfer"]` (lowercase). UI type is `'Cash' | 'GCash' | 'Card' | 'Others'` (title-case). Drizzle doesn't enforce SQLite enum at runtime — silent mismatch.  
**Files touched:** `db/schema/recurringRules.ts`  
**Notes:** `updateRecurringRule` now correctly passes `paymentMethod` through (not defaulting to Cash), fixing BUG-07. The enum declaration mismatch is still a latent risk.

---

## BUG-31 — `advanceNextDueDate` uses UTC ISO string for new nextDueDate

**First seen:** 2026-11-06  
**Status:** open  
**Attempts:** _(none)_  
**Root cause:** Was using `d.toISOString().slice(0, 10)` — UTC. Now uses `toLocalDate(d)` helper.  
**Status:** fixed (2026-11-10, session 4) — confirmed no `toISOString().slice(0,10)` left in stubs.ts.  
**Files touched:** `lib/db/stubs.ts`  
**Notes:** Confirmed fixed.

---

## BUG-32 — `getRulesDueWithin` cutoff date computed in UTC

**First seen:** 2026-11-06  
**Status:** fixed (2026-11-10, session 4)  
**Attempts:** `getRulesDueWithin` now uses `toLocalDate(cutoff)` (confirmed at line 423).  
**Root cause:** Was using `cutoff.toISOString().slice(0, 10)` — UTC.  
**Files touched:** `lib/db/stubs.ts`  
**Notes:** Confirmed fixed.

---

## BUG-33 — Savings Target `0` silently dropped during onboarding

**First seen:** 2026-11-10
**Status:** open
**Attempts:** _(none)_
**Root cause:** `app/onboarding/budget.tsx` line 36: `savingsTarget: parseFloat(savingsTarget ?? '0') || undefined`. `parseFloat('0') || undefined` evaluates to `undefined`, so a user who explicitly enters "0" for their savings target has it silently discarded — `insertProfile` receives `undefined` and stores `0` via the `?? 0` default. For the target-mode user who literally wants ₱0 savings target, this is correct. For salary/mixed users who enter "0" wanting to skip the field, also fine. **Low-impact in practice but technically lossy.** The real risk is if the user enters "0.00" intending to disable savings target — the `0` case is indistinguishable from "not set."
**Files touched:** `app/onboarding/budget.tsx` (line 36)
**Notes:** Only triggers when user explicitly types "0" as savings target value. `canContinue` requires `savingsTarget.length > 0` which is satisfied by "0". Low severity.

---

## BUG-34 — Recurring tab shows "Active" section header when rule list is empty

**First seen:** 2026-11-10
**Status:** open
**Attempts:** _(none)_
**Root cause:** `app/(tabs)/expenses.tsx` lines 235-237: `sections={[{ title: 'Active', data: activeRules }, ...]}` always includes the Active section even when `activeRules` is empty. `SectionList` renders the "Active" header above `ListEmptyComponent`, creating a floating header over the empty state.
**Files touched:** `app/(tabs)/expenses.tsx`
**Notes:** Fix: `sections={activeRules.length > 0 ? [{ title: 'Active', data: activeRules }] : [], ...]}`

---

## BUG-35 — `formatDate` renders historical dates one day behind for UTC+8 users

**First seen:** 2026-11-10
**Status:** open
**Attempts:** _(none)_
**Root cause:** `utils/format.ts` line 38: `new Date(isoDate).toLocaleDateString(...)` — `new Date('YYYY-MM-DD')` treats the string as UTC midnight. For UTC+8 users, `new Date('2026-11-08')` = `2026-11-07T16:00:00+08:00`, rendering as "Nov 7" instead of "Nov 8". The today/yesterday comparison (lines 32-35) is correct (uses local offset), but the fallback date rendering is not.
**Files touched:** `utils/format.ts` (line 38)
**Notes:** Fix: `new Date(isoDate + 'T00:00:00').toLocaleDateString(...)` — appending T00:00:00 (no Z) forces local-time parse in V8/Hermes.

---

## BUG-36 — Dashboard has no MonthNavigator — users cannot change months from home screen

**First seen:** 2026-11-10
**Status:** open
**Attempts:** _(none)_
**Root cause:** `app/(tabs)/index.tsx` renders a static month label but no `<MonthNavigator />`. All other tabs (Expenses, Budgets, Insights) have month navigation. The Dashboard reads from `useUIStore` but provides no way to change the month directly.
**Files touched:** `app/(tabs)/index.tsx`
**Notes:** May be intentional design. Flag for PM confirmation before filing as must-fix.

---

## BUG-37 — Settings day-picker caps at 28, users with 29–31 paydate cannot match their cycle

**First seen:** 2026-11-10
**Status:** open
**Attempts:** _(none)_
**Root cause:** `app/settings.tsx` line 251: `Array.from({ length: 28 }, ...)` — intentionally avoids Feb overflow, but no explanation is shown to users.
**Files touched:** `app/settings.tsx`
**Notes:** Functional cap is acceptable; UX issue is lack of explanation. Consider extending to 31 with note "shortest-month rule applies."
