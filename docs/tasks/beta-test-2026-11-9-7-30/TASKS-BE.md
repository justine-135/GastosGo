# Backend Tasks — Beta Test 2026-11-09 07:30

Target agent: `backend-api-engineer`

---

## TASK-BE-01: Investigate why merchant field is null in Recent Transactions data

**Bug ref:** BUG-02
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** `lib/db/stubs.ts`, `db/queries/expenses.ts`

### What's broken

Recent Transactions shows the category name ("Food") instead of the merchant name ("Jollibee") for an expense that supposedly had merchant set. The `stubs.ts` query (`getRecentExpenses`, line 231-240) correctly selects `merchant` via the `expenseWithCategory` projection and `rowToExpense` maps it at line 189. The display layer does `expense.merchant ?? expense.categoryName` — correct. This means `merchant` is `null` in the DB row at the time of display.

Suspected cause: the Maestro 03-add-expense flow does not scroll the AddExpenseModal to the merchant input field and therefore never submits a merchant value — `insertExpense` receives `merchant: undefined` and stores `null`. This is a test-flow gap, not a data-layer bug, but needs confirmation via manual test.

### Reproduction steps

1. Manually open AddExpenseModal (not via Maestro). Enter amount=250, category=Food, merchant=Jollibee, payment=GCash. Submit.
2. Query the SQLite DB: `SELECT id, merchant, category_id FROM expenses ORDER BY created_at DESC LIMIT 1;`
3. If `merchant` is "Jollibee": display layer is the issue (see TASK-FE-02) — data-layer is fine.
4. If `merchant` is `null`: check `insertExpense` in `lib/db/stubs.ts` (line 242-255) — confirm `input.merchant` arrives as `undefined` or whether the form omits the field on submit.

### Acceptance criteria

- [ ] Root cause documented: is merchant null because (a) the Maestro flow never fills it, (b) the AddExpenseModal form does not include the field in its submit payload, or (c) a data mapping bug in `insertExpense`?
- [ ] If (b): AddExpenseModal submit handler is updated to include `merchant` in the `InsertExpenseInput` payload.
- [ ] If (c): `insertExpense` in `lib/db/stubs.ts` line 250 is confirmed correct (`merchant: input.merchant ?? null`).
- [ ] A manually inserted expense with merchant="Jollibee" returns `merchant: "Jollibee"` from `getRecentExpenses`.

### Technical notes

`insertExpense` in `lib/db/stubs.ts` (line 250):
```ts
merchant: input.merchant ?? null,
```
This is correct — the value is null only if `input.merchant` is undefined/null at call time. Check `app/modals/add-expense.tsx` submit handler to confirm merchant is passed.

`db/queries/expenses.ts` `getRecentExpenses` (line 54-61) does a plain `select()` with no join — it does NOT return `categoryName` or use the `expenseWithCategory` projection. This file is not currently used by the hook (`useExpenses.ts` imports from `lib/db` → `lib/db/stubs.ts`). No fix needed here unless the import chain changes.

### Dependencies

Coordinate with TASK-FE-02 (display format) and TASK-DEVOPS-02 (Maestro flow not filling merchant field).
