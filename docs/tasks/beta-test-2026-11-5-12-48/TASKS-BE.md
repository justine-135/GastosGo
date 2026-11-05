# Backend / Business Logic Tasks — Beta Test 2026-11-05
**Target agent:** `backend-api-engineer`
**Source report:** `docs/bugs/beta-test-2026-11-05-1248.md`

---

## TASK-BE-01: Export single LOCAL_USER_ID constant to fix universal empty-data bug

**Bug ref:** BUG-05
**Priority:** P0
**Type:** DATA
**Files touched:** `lib/constants.ts` (create or update), all hooks and files that reference `'stub-user-001'` or `'local-user'`

### What's broken
Hooks use `USER_ID = 'stub-user-001'` while `insertProfile` writes `userId = 'local-user'`. Every user-scoped query returns empty results because the userId in the read path never matches the userId in the write path. This affects every data-bearing screen in the app.

### Reproduction steps
1. Complete onboarding (data written with `'local-user'`).
2. Open any screen that lists expenses, budgets, or insights (queries with `'stub-user-001'`).
3. Observe: all lists are empty despite data existing in the DB.

### Acceptance criteria
- [ ] A single `LOCAL_USER_ID` constant is exported from `lib/constants.ts` (or the existing constants file).
- [ ] All hooks and DB functions that previously referenced `'stub-user-001'` import and use `LOCAL_USER_ID`.
- [ ] All DB write functions that previously used `'local-user'` import and use `LOCAL_USER_ID`.
- [ ] After the fix, expenses and budgets written during onboarding are visible on the main screens.

### Technical notes
Grep targets: `'stub-user-001'`, `'local-user'`, `USER_ID`. This is a P0 prerequisite for every other task — nothing else is testable until userId is consistent. The constant value should be `'local-user'` to match what `insertProfile` already writes (avoid a data migration).

### Dependencies
none — this is Wave 0, all other tasks depend on it

---

## TASK-BE-02: Fix restore-from-cloud silently failing due to missing module

**Bug ref:** BUG-03
**Priority:** P0
**Type:** BUG
**Files touched:** `lib/restore.ts`, `app/onboarding/index.tsx`

### What's broken
`lib/restore.ts` imports a module that does not exist (or is not installed), causing the restore function to throw at runtime. The caller in `app/onboarding/index.tsx` swallows the error with `.catch(console.warn)`, so the user sees nothing — the restore silently does nothing.

### Reproduction steps
1. Start onboarding.
2. Select "Restore from cloud".
3. Observe: no data is restored, no error is shown to the user. Console shows a warning.

### Acceptance criteria
- [ ] The missing module dependency is resolved (either installed, replaced, or the import is corrected).
- [ ] The caller in `app/onboarding/index.tsx` replaces `.catch(console.warn)` with a handler that surfaces an error message to the user.
- [ ] On restore failure, the user sees a clear error message and can retry or skip.

### Technical notes
Identify the missing module from the `lib/restore.ts` import list. If it was an internal module that was deleted, trace the original intent and re-implement or remove the dead code path. The `.catch(console.warn)` anti-pattern should be replaced with a `.catch(err => setError(err.message))` pattern wired to UI state.

### Dependencies
none — parallel-safe (does not depend on TASK-BE-01 since it's a module resolution issue, not a userId query issue)

---

## TASK-BE-03: Fix recurring expense paymentMethod hardcoded to 'Cash'

**Bug ref:** BUG-07
**Priority:** P1
**Type:** BUG
**Files touched:** `lib/db/stubs.ts`

### What's broken
`lib/db/stubs.ts` line 384: the `paymentMethod` field for recurring expenses is hard-coded to `'Cash'` regardless of what the user selects. User payment method selection is silently lost on save.

### Reproduction steps
1. Add a recurring expense.
2. Select a payment method other than "Cash" (e.g., "Credit Card").
3. Save and reopen the recurring expense.
4. Observe: payment method shows "Cash".

### Acceptance criteria
- [ ] The `paymentMethod` field is passed through from the caller, not hard-coded.
- [ ] The function signature accepts `paymentMethod` as a parameter.
- [ ] Saving a recurring expense with "Credit Card" persists "Credit Card".

### Technical notes
`lib/db/stubs.ts` line 384. Find the insertion function for recurring expenses and change the hard-coded `paymentMethod: 'Cash'` to use the passed-in value.

### Dependencies
none — parallel-safe

---

## TASK-BE-04: Fix Insights screen firing 12 DB round-trips — use getMultiMonthSummary

**Bug ref:** BUG-09
**Priority:** P1
**Type:** PERFORMANCE
**Files touched:** `app/(tabs)/insights.tsx`

### What's broken
`insights.tsx` lines 25–31 call individual DB query functions in a loop or sequence, resulting in ~12 separate DB round-trips per render. The consolidated `getMultiMonthSummary` function already exists but is not used.

### Reproduction steps
1. Open the Insights tab.
2. Observe DB query logs or profiling — 12+ individual queries fire instead of 1.

### Acceptance criteria
- [ ] Insights data fetching uses `getMultiMonthSummary` instead of individual per-month calls.
- [ ] Total DB round-trips for the Insights screen is 1 (or ≤ 2 if a separate summary call is needed).
- [ ] Displayed data is functionally identical to before.

### Technical notes
`insights.tsx` lines 25–31. Replace the loop/individual calls with a single `getMultiMonthSummary` call. Verify the return shape matches what the chart components expect.

### Dependencies
TASK-BE-01 (userId fix) — queries will return empty until userId is consistent.
⚠️ file conflict — `app/(tabs)/insights.tsx` also touched by TASK-FE-10 and TASK-FE-11. Assign all Insights tasks to the same agent.

---

## TASK-BE-05: Fix date stored as UTC causing off-by-one-day for PST users

**Bug ref:** BUG-08
**Priority:** P1
**Type:** BUG
**Files touched:** `app/add-expense.tsx`, `app/add-recurring.tsx`

### What's broken
`add-expense.tsx` line 272 and `add-recurring.tsx` line 216 pass the raw `DateTimePicker` value (UTC) directly to the DB without localizing to the user's timezone. For users in PST (UTC-8), an expense entered at any time before 8am is stored with yesterday's date.

### Reproduction steps
1. Set device timezone to PST (UTC-8).
2. Add an expense before 8am local time.
3. View the expense — it shows yesterday's date.

### Acceptance criteria
- [ ] Date stored in DB uses the local date string (YYYY-MM-DD in user's timezone), not UTC.
- [ ] An expense added at 7am PST on Nov 5 is stored as 2026-11-05, not 2026-11-04.
- [ ] `add-expense.tsx` and `add-recurring.tsx` are both fixed.

### Technical notes
Use `Intl.DateTimeFormat` or the `date-fns-tz` library (check if installed) to convert the UTC Date to a local date string before passing to the DB. Alternatively: `new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]`. See also TASK-BE-06 (same timezone class of bug in format utils).

### Dependencies
none — parallel-safe; coordinate with TASK-BE-06 which fixes the same class of bug in `utils/format.ts`

---

## TASK-BE-06: Fix "Today/Yesterday" labels wrong for PST users before 8am

**Bug ref:** BUG-22
**Priority:** P1
**Type:** BUG
**Files touched:** `utils/format.ts`

### What's broken
`utils/format.ts` lines 29–38: the "Today" / "Yesterday" label logic compares dates without accounting for timezone. For PST users before 8am, `new Date()` in UTC is already the next day, so today's expenses are labelled "Yesterday".

### Reproduction steps
1. Set device timezone to PST (UTC-8).
2. Before 8am local time, open the expense list.
3. Observe: today's expenses are labelled "Yesterday".

### Acceptance criteria
- [ ] "Today" / "Yesterday" labels use the device's local date, not UTC.
- [ ] An expense added at 7am PST on Nov 5 shows "Today" on Nov 5 at 7am PST.

### Technical notes
`utils/format.ts` lines 29–38. Replace `new Date()` comparisons with local-date-aware comparisons. Use `startOfToday` from `date-fns` (check if installed) or manually compute `new Date(new Date().setHours(0,0,0,0))` as the local day boundary.

### Dependencies
none — parallel-safe; coordinate with TASK-BE-05 which fixes the upstream storage of UTC dates

---

## TASK-BE-07: Fix missing invalidateQueries after insertCategory

**Bug ref:** BUG-24
**Priority:** P2
**Type:** BUG
**Files touched:** the hook or screen that calls `insertCategory` (locate via grep)

### What's broken
After a new category is inserted, the category list query cache is not invalidated. The new category does not appear in any list until the user manually refreshes or navigates away and back.

### Reproduction steps
1. Navigate to category management.
2. Add a new category.
3. Observe: new category does not appear in the list immediately.
4. Navigate away and return — category appears.

### Acceptance criteria
- [ ] `queryClient.invalidateQueries({ queryKey: ['categories'] })` (or the equivalent key) is called after a successful `insertCategory`.
- [ ] New category appears in the list immediately after adding.

### Technical notes
Grep for `insertCategory` to find the call site. Add `invalidateQueries` in the mutation's `onSuccess` callback. Confirm the query key matches what the category list hook uses.

### Dependencies
TASK-BE-01 (userId fix) — category queries may return empty until userId is consistent.
