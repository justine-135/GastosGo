# DB Tasks — Beta Test 2026-11-06 12:48

Target agent: `db-schema-engineer`

---

## TASK-DB-01: Fix userId=null on insertCategory and align query guards in getMonthlyExpenseSummary / getMultiMonthSummary

**Bug ref:** BUG-25, BUG-26
**Priority:** P1
**Type:** BUG
**Files touched:** `lib/db/stubs.ts`

### What's broken

`insertCategory` (line 143) always writes `userId: null`. The two summary functions — `getMonthlyExpenseSummary` (line 533) and `getMultiMonthSummary` (line 585) — query categories with `eq(categoriesTable.userId, userId)`, so they never match those null-userId rows. Result: `totalBudget` is always 0, and the orange budget bars in the 6-month bar chart render at zero height. User-created categories are also silently invisible to every query that filters by userId.

**Design decision to make first:** decide whether `insertCategory` should write `LOCAL_USER_ID` (align writes to reads) or keep `null` (align reads to writes via `isNull` guard, as already done in `getBudgetProgress`). The simpler long-term answer is to write `LOCAL_USER_ID` — eliminates the guard entirely and keeps the data consistent. If the team prefers keeping `null`, apply the same `or(eq(...userId, userId), isNull(...userId))` guard used in `getBudgetProgress` to both summary functions instead.

### Reproduction steps

1. Complete onboarding and set category budgets.
2. Open Add Expense, tap "+ New", create a custom category.
3. Navigate to Insights tab — 6-month bar chart shows orange budget bars at zero height.
4. Inspect SQLite: new category row has `userId: null`; `SELECT sum(monthlyBudget) FROM categories WHERE userId = 'local'` returns 0.

### Acceptance criteria

- [ ] `insertCategory` writes a non-null userId (either `LOCAL_USER_ID` or whichever value callers pass in).
- [ ] `getMonthlyExpenseSummary` returns a non-zero `totalBudget` when categories with budgets exist.
- [ ] `getMultiMonthSummary` returns non-zero `totalBudget` for every month in the range when categories with budgets exist.
- [ ] Insights 6-month bar chart renders orange budget bars at the correct height.
- [ ] No regression in `getBudgetProgress` or any other function that queries categories.

### Technical notes

**BUG-26 root (line 143):**
```ts
// current
userId: null,

// option A — preferred: align writes to reads
userId: LOCAL_USER_ID,  // import from lib/auth (or wherever LOCAL_USER_ID is exported)

// option B — align reads to writes (keep null, add guard)
// no change to insertCategory; apply isNull guard to summary queries below instead
```

**BUG-25 fix — same two-liner already used in getBudgetProgress:**
```ts
// getMonthlyExpenseSummary line 533 — current:
.where(eq(categoriesTable.userId, userId))

// fix (option B) or remove guard entirely (option A):
.where(or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId)))
```

```ts
// getMultiMonthSummary line 585 — current:
.where(eq(categoriesTable.userId, userId))

// same fix as above
```

If option A is chosen (write `LOCAL_USER_ID` in `insertCategory`), the query guards are unnecessary — revert `getBudgetProgress` to the simpler `eq` form too for consistency.

### Dependencies

None — parallel-safe. Single file, single atomic change.
