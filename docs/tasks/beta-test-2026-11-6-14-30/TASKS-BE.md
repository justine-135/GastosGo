# TASKS-BE.md — Backend / Business Logic
**Target agent:** `backend-api-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-06-1430.md`
**Date:** 2026-11-06

---

## TASK-BE-01: Fix getBudgetProgress to match seeded NULL-userId categories

**Bug ref:** BUG-16
**Priority:** P1
**Type:** REGRESSION
**Files touched:** `lib/db/stubs.ts`

### What's broken
`getBudgetProgress` filters categories with `eq(categoriesTable.userId, userId)`. Seeded default categories are inserted with `userId = null`, so the WHERE clause never matches them and the Budgets screen returns an empty array for every user. The fix (`or(eq(...), isNull(...))`) was planned but never applied; `isNull` and `or` are not in the import list at line 5.

### Reproduction steps
1. Fresh install (or clear app data).
2. Add any expense.
3. Open Budgets tab.
4. Screen shows empty state despite categories existing.

### Acceptance criteria
- [ ] `isNull` and `or` are imported from `drizzle-orm` at the top of `lib/db/stubs.ts`.
- [ ] The `.where()` clause in `getBudgetProgress` uses `or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId))`.
- [ ] Budgets screen shows rows when default (NULL-userId) categories exist.
- [ ] No regression on user-scoped (non-null userId) categories.

### Technical notes
Current import line 5:
```ts
import { and, desc, eq, gte, lte, sql, sum } from 'drizzle-orm';
```
Must add `isNull, or`. The WHERE fix at line 306:
```ts
// before
.where(eq(categoriesTable.userId, userId))
// after
.where(or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId)))
```

### Dependencies
None — parallel-safe. TASK-DB-01 and TASK-DB-02 add columns but do not change the categories WHERE clause.

---

## TASK-BE-02: Fix getMonthlyExpenseSummary and getMultiMonthSummary to include NULL-userId categories in budget total

**Bug ref:** BUG-25
**Priority:** P1
**Type:** REGRESSION
**Files touched:** `lib/db/stubs.ts`

### What's broken
Both `getMonthlyExpenseSummary` (line ~533) and `getMultiMonthSummary` (line ~585) sum `categoriesTable.monthlyBudget` with `.where(eq(categoriesTable.userId, userId))`. Because seeded categories have `userId = null`, the budget total is always 0. The 6-Month Overview bar chart on the Insights screen consequently shows zero-height budget bars.

### Reproduction steps
1. Set a monthly budget on any category.
2. Open Insights → 6-Month Overview.
3. Budget bars in the bar chart are zero height.

### Acceptance criteria
- [ ] Both functions use `or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId))` for the categories filter.
- [ ] `isNull` and `or` imports added (shared with TASK-BE-01, same file edit).
- [ ] Insights 6-Month chart shows non-zero budget bars after a budget is set.

### Technical notes
Two locations to patch — both use identical `.where(eq(categoriesTable.userId, userId))` on `categoriesTable`:
- `getMonthlyExpenseSummary`: line ~533, the second `db.select` block.
- `getMultiMonthSummary`: line ~585, the second `db.select` block (Query 2 comment).

Same import additions as TASK-BE-01 cover both.

### Dependencies
⚠️ file conflict — `lib/db/stubs.ts` is also touched by TASK-BE-01. Assign both tasks to the same agent or sequence TASK-BE-02 after TASK-BE-01.

---

## TASK-BE-03: Wire monthlySalary through insertProfile / updateProfile into the DB

**Bug ref:** BUG-28
**Priority:** P1
**Type:** BUG
**Files touched:** `lib/db/stubs.ts`

### What's broken
`insertProfile` accepts `input.monthlySalary` (the `InsertProfileInput` type includes it), but never writes it to the DB because `profilesTable` has no `monthly_salary` column. `rowToProfile` hardcodes `monthlySalary: null` at line 56. Until TASK-DB-01 adds the column and TASK-BE-03 wires the write, every Savings Gap calculation falls back to 0 income.

### Reproduction steps
1. Onboarding → choose Fixed Salary → enter ₱25,000 → complete onboarding.
2. Open Dashboard → Savings Gap.
3. Income shows ₱0; gap is wrong/negative.

### Acceptance criteria
- [ ] After TASK-DB-01 lands, `insertProfile` writes `monthly_salary` from `input.monthlySalary`.
- [ ] `updateProfile` also writes `monthly_salary` when present in the patch.
- [ ] `rowToProfile` reads `row.monthlySalary` instead of hardcoding `null`.
- [ ] `getSavingsGap` returns the correct income when no income records exist (fallback to `monthlySalary`).
- [ ] The comment `// shortcut: schema has no monthlySalary / expoPushToken columns yet` is removed from `rowToProfile`.

### Technical notes
`rowToProfile` shortcut comment at line 55–56. After TASK-DB-01 adds the column:
```ts
monthlySalary: row.monthlySalary ?? null,
```
`insertProfile` and `updateProfile` patch objects need:
```ts
if (input.monthlySalary !== undefined) patch.monthlySalary = input.monthlySalary;
```
`getSavingsGap` fallback at line 351 is already correct once `profile.monthlySalary` is populated.

### Dependencies
⚠️ file conflict — `lib/db/stubs.ts` also touched by TASK-BE-01, TASK-BE-02. Assign to same agent or sequence last in the stubs.ts chain.
Blocked by TASK-DB-01 (column must exist before writing to it).

---

## TASK-BE-04: Fix "Mark as Paid" date to use local Philippine time, not UTC

**Bug ref:** BUG-29
**Priority:** P2
**Type:** BUG
**Files touched:** `hooks/useRecurring.ts`

### What's broken
`useMarkRuleAsPaid` at line 74 produces the expense date with:
```ts
date: new Date().toISOString().split('T')[0]
```
`toISOString()` always returns UTC. Between midnight and 08:00 Philippine Standard Time (UTC+8) this yields the previous calendar day, so the recorded expense date is off by one.

### Reproduction steps
1. Add a recurring rule.
2. After midnight local Philippine time (00:00–07:59 PHT), tap "Mark as Paid".
3. Expense is recorded with yesterday's date.

### Acceptance criteria
- [ ] The date string uses local Philippine time (or at minimum the device's local timezone).
- [ ] An expense paid at 01:00 PHT on the 5th is recorded as the 5th, not the 4th.
- [ ] No other date logic in the file is changed.

### Technical notes
Preferred minimal fix — produce a local YYYY-MM-DD without adding a dependency:
```ts
const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const localDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
```
Device timezone applies because `getFullYear/getMonth/getDate` are local. This is correct for the Philippine market (single timezone, no DST).

### Dependencies
None — parallel-safe.
