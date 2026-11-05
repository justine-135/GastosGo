# Database / Query Tasks — Beta Test 2026-11-05
**Target agent:** `db-schema-engineer`
**Source report:** `docs/bugs/beta-test-2026-11-05-1248.md`

---

## TASK-DB-01: Fix getBudgetProgress excluding default categories (userId = NULL)

**Bug ref:** BUG-16
**Priority:** P2
**Type:** BUG
**Files touched:** `lib/db/stubs.ts` (or wherever `getBudgetProgress` is defined)

### What's broken
`getBudgetProgress` filters categories by `userId = <current user>`, which excludes seeded default categories stored with `userId = NULL`. The budget screen is always empty for users whose budgets reference default categories.

### Reproduction steps
1. Complete onboarding (default categories seeded with `userId = NULL`).
2. Set a budget for one of the default categories.
3. Navigate to the budget progress screen.
4. Observe: budget screen is empty despite a budget being set.

### Acceptance criteria
- [ ] `getBudgetProgress` query includes categories where `userId = LOCAL_USER_ID OR userId IS NULL`.
- [ ] Budget progress screen shows data for both user-created and default categories.
- [ ] Existing behavior for user-specific categories is unchanged.

### Technical notes
Drizzle ORM: use `or(eq(categories.userId, LOCAL_USER_ID), isNull(categories.userId))` in the where clause. Confirm Drizzle's `isNull` helper is imported. This is a query-only fix — no schema change required.

### Dependencies
TASK-BE-01 (userId constant fix) — `LOCAL_USER_ID` must be the shared constant once that task is merged.

---

## TASK-DB-02: Fix getMultiMonthSummary month key missing zero-padding

**Bug ref:** BUG-25
**Priority:** P3
**Type:** BUG
**Files touched:** `lib/db/stubs.ts` (or wherever `getMultiMonthSummary` is defined)

### What's broken
`getMultiMonthSummary` generates month keys (e.g., `'2026-1'` for January) without zero-padding the month number. Any consumer that expects ISO-style keys (`'2026-01'`) will fail to match, causing latent data mismatches for months 1–9.

### Reproduction steps
1. Navigate to Insights for any month between January and September.
2. Inspect the returned month keys — they lack leading zeros (e.g., `'2026-9'` instead of `'2026-09'`).
3. Any downstream sort or lookup by month key returns incorrect results.

### Acceptance criteria
- [ ] Month keys in `getMultiMonthSummary` output use zero-padded month numbers (`YYYY-MM` format).
- [ ] `'2026-09'` not `'2026-9'`.
- [ ] Months 10–12 are unaffected (already two digits).

### Technical notes
In the month key construction, replace `month` (or `date.getMonth() + 1`) with `String(date.getMonth() + 1).padStart(2, '0')`. Alternatively use `date-fns` `format(date, 'yyyy-MM')` if the library is available.

### Dependencies
none — parallel-safe; but coordinate with TASK-BE-04 which is the primary consumer of this function.

---

## TASK-DB-03: Replace newId() with randomUUID() to prevent ID collisions under rapid inserts

**Bug ref:** BUG-20
**Priority:** P3
**Type:** BUG
**Files touched:** `lib/db/stubs.ts` (or wherever `newId()` is defined)

### What's broken
`newId()` uses a collision-prone ID generation strategy (likely a short random string or timestamp-based ID). Under rapid inserts (e.g., bulk import or fast tapping), IDs can collide, causing silent data overwrites or unique constraint violations.

### Reproduction steps
1. Rapidly insert multiple expenses in quick succession (e.g., automated test or fast tapping).
2. Check the DB — some inserts may have been silently dropped or overwritten.

### Acceptance criteria
- [ ] `newId()` is replaced with `crypto.randomUUID()` (available in React Native's Hermes runtime) or `uuid` package's `v4()`.
- [ ] All callers of `newId()` continue to work without changes (the function signature is preserved, only the implementation changes).
- [ ] No ID collisions under rapid inserts.

### Technical notes
`crypto.randomUUID()` is available in Hermes (React Native's JS engine) without any additional package. Verify with `typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'`. If not available, fall back to the `uuid` package (check if installed before adding a dependency).

### Dependencies
none — parallel-safe
