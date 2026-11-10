# Hooks Review

Reviewed: `useExpenses`, `useBudgets`, `useRecurring`, `useSavings`.

---

## Cross-cutting (all hooks)
**Severity:** Medium

### Issues
- [Medium] `LOCAL_USER_ID` is baked into every query-key factory via a module-level `const USER_ID = LOCAL_USER_ID`. This is multi-user-hostile: when auth lands, the user id must become a **parameter** (`expenseKeys(userId, month, year)`) threaded from a session hook, or every cached query will collide across accounts. Today it's correct for a single-user local app; flag it as the #1 scaling constraint. The `const USER_ID = LOCAL_USER_ID` alias in four files is also redundant indirection — import and use `LOCAL_USER_ID` directly, or better, centralize the key factories.
- [Medium] **Invalidation breadth is inconsistent.** `useAddExpense` invalidates a *specific* `expenseKeys(month, year)` but a *broad* `['budgets']` and `['savings']` (all months). `useBudgets`/`useUpdateBudget` invalidates broad `['budgets']` but **never invalidates `['expenses']` or `['savings']`** — yet changing a budget changes `percent`, which is derived against spend. The asymmetry means editing a budget won't refresh a savings/insights view that's already mounted. Decide one policy (prefer: invalidate the semantic domains a write touches, consistently) and apply it everywhere.
- [Low] Every query repeats `staleTime: 30_000`. This already matches the `QueryClient` default set in `app/_layout.tsx`, so these are redundant. Remove them, or if intentional, hoist to a shared constant.

### Strengths
- Query-key factories (`expenseKeys`, `budgetKeys`, `savingsKeys`, `recurringKeys`) are the correct pattern — stable, typed with `as const`, co-located. This is textbook React Query.
- Mutations consistently invalidate `recentExpensesKey()` alongside the month key, so the dashboard stays fresh.

---

## useExpenses (`hooks/useExpenses.ts`)
**Severity:** Medium

### Issues
- [Medium] `useDeleteExpense` takes `{ id, date }` but the `mutationFn` ignores `date` (`deleteExpense(id)` only). `date` is used in `onSuccess` to compute which month key to invalidate — correct, but the unused destructure in the fn signature reads like a bug. Add a comment or drop it from the fn param.
- [Low] `onSuccess` does `await enqueue(...)` **after** `await qc.invalidateQueries(...)`. If `enqueue` (the offline sync queue) throws, the invalidations already ran but the mutation's `onSuccess` rejects — React Query will treat the mutation as errored despite the DB write succeeding. Enqueue first (or wrap in its own try/catch) so a sync-queue hiccup doesn't surface as a failed save.
- [Low] No `onError` / rollback on any mutation. For `add`/`update`/`delete` there's no optimistic update, so this is acceptable — but worth noting there's no user-facing retry for a failed invalidation.

### Strengths
- Month-scoped invalidation using the inserted row's actual date (`d.getMonth()+1`) is precise — avoids nuking unrelated months. Good.

---

## useBudgets (`hooks/useBudgets.ts`)
**Severity:** Medium

### Issues
- [Medium] `useUpdateBudget` invalidates only `['budgets']`. `budgets.tsx` calls this "optimistic" (per its comment) but there is **no `onMutate`/optimistic cache write** — the UI waits for invalidation + refetch. Either implement a real optimistic update (`onMutate` setting the new `monthlyBudget` and `percent`, with `onError` rollback) or fix the misleading comment in `budgets.tsx:35`.
- [Low] Missing cross-invalidation of `['savings']`/insights, which derive from budget totals (see cross-cutting note).

### Strengths
- Minimal and correct for a read + single mutation. The `updateCategory` call is the right boundary.

---

## useRecurring (`hooks/useRecurring.ts`)
**Severity:** Medium

### Issues
- [Medium] Line 74: inline IIFE building today's `YYYY-MM-DD` inside the `insertExpense` call:
  `date: (() => { const now = new Date(); const pad = ...; return \`${...}\`; })()`.
  This exact logic is duplicated (in a different form) in `add-expense.tsx:50`, `add-recurring.tsx:28`, and `utils/format.ts`'s `formatDate`. Extract one `formatToday(): string` into `utils/format.ts` and reuse. (This IIFE also differs subtly from the modals' version — the modals use the `getTimezoneOffset` trick, this one uses local getters; converging them removes a timezone-inconsistency risk.)
- [Low] `useMarkRuleAsPaid` invalidates broad `['expenses']` and `['budgets']` — consistent with the "broad" style but see cross-cutting note on picking one policy. It does **not** invalidate `['savings']`, though marking a bill paid inserts an expense that affects the savings gap. Likely a bug.
- [Low] `recurringKeys` is an object-with-methods while the other three hooks use plain functions. Harmless, but unify the shape for consistency.

### Strengths
- `useMarkRuleAsPaid` correctly parallelizes `advanceNextDueDate` + `insertExpense` with `Promise.all`, then enqueues both sync ops together, returning both results. The compound-write orchestration is well done.

---

## useSavings (`hooks/useSavings.ts`)
**Severity:** Info

### Issues
- [Info] Pure read hook with no mutation. Its cache is invalidated *by* `useAddExpense`/`SavingsScreen` but, per cross-cutting, **not** by budget or mark-paid mutations that also move the gap. Nothing to change in this file; the fix lives in the writing hooks.

### Strengths
- Smallest, cleanest hook. Correct key factory and query. No notes.
