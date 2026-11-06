# TASKS-DEVOPS.md — DevOps / Build / Config
**Target agent:** `devops-pipeline-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-06-1430.md`
**Date:** 2026-11-06

---

## TASK-DEVOPS-01: Persist payment_method in recurring rules — write path in stubs and sync queue

**Bug ref:** BUG-07
**Priority:** P3
**Type:** BUG
**Files touched:** `lib/db/stubs.ts`

### What's broken
After TASK-DB-02 adds `payment_method` to `recurringRulesTable`, the insert and update functions in `lib/db/stubs.ts` for recurring rules must write the column value. Currently they omit it, so the DB column would remain at its default (`'cash'`) even after the migration lands. This is a pure backend concern but is listed here because it is the final plumbing step for BUG-07, isolated from the P1 stubs.ts edits in TASK-BE-01/02/03.

### Reproduction steps
1. After TASK-DB-02 adds the column, add a recurring rule with GCash.
2. Reload app.
3. Rule still shows "Cash" — write path not wired.

### Acceptance criteria
- [ ] `insertRecurringRule` in `lib/db/stubs.ts` writes `paymentMethod` to the column.
- [ ] `updateRecurringRule` (if it exists) also includes `paymentMethod` in its patch.
- [ ] `rowToRecurringRule` (or equivalent mapper) reads `row.paymentMethod` and returns it.
- [ ] After reload, the saved payment method persists correctly.

### Technical notes
Check `lib/db/stubs.ts` for `insertRecurringRule` and any mapper. Pattern mirrors how `insertExpense` handles `paymentMethod` — follow the same convention.

Also check `hooks/useRecurring.ts` — if the hook builds the insert payload, confirm `paymentMethod` is included in the object passed to `insertRecurringRule`.

### Dependencies
⚠️ file conflict — `lib/db/stubs.ts` also touched by TASK-BE-01, TASK-BE-02, TASK-BE-03. Assign to same agent or sequence after all three BE tasks complete.
Blocked by TASK-DB-02 (column must exist).
