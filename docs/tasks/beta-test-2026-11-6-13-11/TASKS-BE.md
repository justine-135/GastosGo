# TASKS-BE — beta-test-2026-11-6-13-11

Target agent: `backend-api-engineer`
Source report: `docs/bugs/bug-report-2026-11-06-1311.md`

---

## TASK-BE-01: Fix paymentMethod cast in stubs.ts to use canonical PaymentMethod values

**Bug ref:** BUG-30
**Priority:** P1
**Type:** BUG
**Files touched:**
- `lib/db/stubs.ts`

### What's broken
`insertRecurringRule` (line 445) and `updateRecurringRule` (line 467) cast `input.paymentMethod` to the Drizzle insert type with `as typeof recurringRulesTable.$inferInsert['paymentMethod']`. Once TASK-DB-01 updates the schema enum to title-case, this cast will work correctly — but until then, any value read back from `rowToRecurringRule` (line 386) also casts `row.paymentMethod as RecurringRule['paymentMethod']`, meaning data round-trips silently with the wrong casing. This task also covers confirming that `insertExpense` / `updateExpense` have the same pattern for `expensesTable.paymentMethod` and are consistent after the schema fix.

### Reproduction steps
1. Add a recurring bill with payment method "GCash".
2. Read back the rule via `getRecurringRules`.
3. Observe `paymentMethod` is `'GCash'` in the JS object but `'gcash'` (or mismatched) in the DB row before the schema fix.

### Acceptance criteria
- [ ] After TASK-DB-01 lands, `rowToRecurringRule` (line 386) and the insert/update casts (lines 445, 467) all agree with the new title-case schema enum — no `as` cast is hiding a real type mismatch.
- [ ] `rowToExpense` (line 186) and expense insert/update receive the same audit and are consistent.
- [ ] No TypeScript errors in `lib/db/stubs.ts` after the schema enum change.
- [ ] Existing unit/integration tests for recurring rule CRUD pass.

### Technical notes
Key lines in `lib/db/stubs.ts`:
- Line 386: `paymentMethod: row.paymentMethod as RecurringRule['paymentMethod']` in `rowToRecurringRule`
- Line 445: `paymentMethod: input.paymentMethod as typeof recurringRulesTable.$inferInsert['paymentMethod']` in `insertRecurringRule`
- Line 467: same cast in `updateRecurringRule`
- Line 186: `paymentMethod: row.paymentMethod as Expense['paymentMethod']` in `rowToExpense`

This task is essentially a verification + cleanup pass after DB-01 settles the schema. If the casts become unnecessary (types align directly), remove them.

### Dependencies
- Depends on TASK-DB-01 (schema enum must be updated first).
- ⚠️ file conflict — `lib/db/stubs.ts` is also touched by TASK-BE-02 and TASK-BE-03. Assign all three BE tasks to the same agent or sequence BE-01 → BE-02 → BE-03.

---

## TASK-BE-02: Fix advanceNextDueDate UTC offset bug (off-by-one next due date before 8am UTC+8)

**Bug ref:** BUG-31
**Priority:** P2
**Type:** BUG
**Files touched:**
- `lib/db/stubs.ts`

### What's broken
`advanceNextDueDate` in `lib/db/stubs.ts` (line 498) writes the new `nextDueDate` with `d.toISOString().slice(0, 10)`. `toISOString()` returns UTC, so for UTC+8 users between 00:00 and 07:59 local time the date string is one day behind the local date. A rule due Nov 30 marked paid at 01:00 UTC+8 computes the next due as Dec 29 instead of Dec 30 (the UTC timestamp is still Nov 29).

The fix pattern is already established by BUG-29: replace `d.toISOString().slice(0, 10)` with a local-date formatter using `getFullYear / getMonth / getDate`.

### Reproduction steps
1. Create a monthly recurring rule with next due date Nov 30.
2. Set device timezone to UTC+8.
3. Mark the rule as paid between 00:00 and 07:59 local time.
4. Observe `nextDueDate` stored as `2024-12-29` instead of `2024-12-30`.

### Acceptance criteria
- [ ] `advanceNextDueDate` stores `nextDueDate` using local date components, not UTC.
- [ ] The fix is a one-liner: `d.toISOString().slice(0, 10)` replaced with `` `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` `` (or extracted to a shared `toLocalDateString` helper if one already exists in the file).
- [ ] `advanceNextDueDate` in `db/queries/recurringRules.ts` (line 89) has the identical pattern — fix it there too in the same PR.
- [ ] A unit test covers the midnight-to-8am UTC+8 window edge case (mock `Date` to a UTC time that is previous calendar day locally).

### Technical notes
Buggy line in `lib/db/stubs.ts`:
```ts
// line 498
return updateRecurringRule(ruleId, { firstDueDate: d.toISOString().slice(0, 10) });
```
Buggy line in `db/queries/recurringRules.ts`:
```ts
// line 89 — computeNextDate return
return d.toISOString().slice(0, 10); // YYYY-MM-DD
```
Both files implement the same logic independently. Fix both in one pass.

BUG-29 established the fix pattern: use `d.getFullYear()`, `d.getMonth() + 1`, `d.getDate()` padded to 2 digits.

### Dependencies
- ⚠️ file conflict — `lib/db/stubs.ts` is also touched by TASK-BE-01 and TASK-BE-03. Assign all three to the same agent or sequence BE-01 → BE-02 → BE-03.
- ⚠️ file conflict — `db/queries/recurringRules.ts` is touched only by this task; no other conflict.

---

## TASK-BE-03: Fix getRulesDueWithin UTC offset bug (bills missing from "Bills Due 7d" before 8am UTC+8)

**Bug ref:** BUG-32
**Priority:** P2
**Type:** BUG
**Files touched:**
- `lib/db/stubs.ts`

### What's broken
`getRulesDueWithin` in `lib/db/stubs.ts` (lines 416-431) computes the 7-day cutoff as `cutoff.toISOString().slice(0, 10)`. Before 08:00 local time for UTC+8 users, this produces yesterday's UTC date as the cutoff, excluding bills that are due in exactly 7 local days. The dashboard "Bills Due (7d)" card will silently drop those entries.

Note: `db/queries/recurringRules.ts` has a separate `getRulesDueWithin` that uses SQLite's `date('now', '+N days')` (line 9) which runs in the DB server's timezone — this is the correct approach. The stubs version needs to match it.

### Reproduction steps
1. Create a recurring rule with `nextDueDate` exactly 7 local days from today.
2. Set device timezone to UTC+8.
3. Open the dashboard before 08:00 local time.
4. Observe the bill is missing from the "Bills Due (7d)" card.

### Acceptance criteria
- [ ] `getRulesDueWithin` in `lib/db/stubs.ts` uses local date components for the cutoff string, consistent with TASK-BE-02's fix pattern.
- [ ] Bills due in exactly 7 local days appear on the dashboard at any hour of the day.
- [ ] A unit test covers a bill due in exactly 7 days queried at 01:00 UTC (which is 09:00 UTC+8 the previous calendar day).

### Technical notes
Buggy lines in `lib/db/stubs.ts`:
```ts
// lines 416-418
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() + days);
const cutoffIso = cutoff.toISOString().slice(0, 10);  // <-- UTC, not local
```
Fix: replace `cutoff.toISOString().slice(0, 10)` with the same local-date formatter used in TASK-BE-02.

The `db/queries/recurringRules.ts` version is already correct (uses SQLite `date('now', ...)` server-side) — do not change it.

### Dependencies
- ⚠️ file conflict — `lib/db/stubs.ts` is also touched by TASK-BE-01 and TASK-BE-02. Assign all three to the same agent or sequence BE-01 → BE-02 → BE-03.
- none with `db/queries/recurringRules.ts` for this specific fix.
