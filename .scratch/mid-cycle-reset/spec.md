# Mid-Cycle Reset

Status: ready-for-agent

## Problem Statement

A user who entered incorrect income or Expected Savings at the start of a Budget Cycle has no way to correct those figures mid-cycle. The only recourse today is to wait for the next cycle, leaving the Savings Gap display wrong for the entire current period. Users who also want to wipe their logged expenses and start fresh have no path to do so without manually deleting each expense individually.

## Solution

Add a "Reset Current Cycle" action in Settings that lets the user update their income figures and Expected Savings for the active Budget Cycle, with an optional second step to soft-delete all expenses logged so far in that cycle. The action is destructive enough to require explicit confirmation at each step, but non-permanent: wiped expenses land in Recently Deleted and are recoverable for 30 days.

## User Stories

1. As a user, I want to access a "Reset Current Cycle" option in Settings, so that I know where to go when my income figures are wrong.
2. As a user, I want to see my current income figures and Expected Savings before confirming a reset, so that I can verify what I am changing from.
3. As a user, I want to enter new income figures and Expected Savings for the current cycle, so that the Savings Gap reflects my corrected numbers immediately.
4. As a user, I want to see a confirmation prompt that shows both the old and new figures before the reset applies, so that I can catch mistakes before committing.
5. As a user, I want the Savings Gap on the Home screen to reflect my new figures immediately after a reset, so that the display is correct for the rest of the cycle.
6. As a user, I want to be offered the option to also clear all expenses from the current cycle after updating my income figures, so that I can start completely fresh if I need to.
7. As a user, I want to see a list (or count) of the expenses that will be removed before I confirm the expense wipe, so that I know what I am about to delete.
8. As a user, I want wiped expenses to go to Recently Deleted rather than being permanently destroyed, so that I can recover accidental deletions within 30 days.
9. As a user, I want to be able to skip the expense wipe and only update the income figures, so that a figure correction does not force me to lose my expense history.
10. As a user, I want the reset to only affect the current Budget Cycle, so that my historical Savings Gap data for past cycles is preserved correctly.
11. As a user, I want Category Limits and Budget Carryover settings to remain unchanged after a reset, so that I do not have to reconfigure my budgets.
12. As a user, I want Recurring Rules to remain unaffected by a reset, so that my scheduled expenses continue as normal.

## Implementation Decisions

- **Schema migration — drop UNIQUE constraint on `cycle_snapshots.cycle_start_date`**: The current schema enforces `UNIQUE` on that column. The mid-cycle reset inserts a second row with the same `cycle_start_date` and updated figures. The constraint must be dropped via a migration (recreate the table without it, using the existing pattern in `migrations.ts` for destructive table changes). The old row is preserved as the implicit audit trail.

- **`getLatestCycleSnapshot` ordering**: Once multiple rows per `cycle_start_date` are allowed, the query must order by `created_at DESC` (not `cycle_start_date DESC`) to reliably return the most recent reset for the current cycle.

- **New DB function — `resetCurrentCycle(db, input)`**: A single function that wraps both the new snapshot insert and the optional expense soft-delete in one place. Callers pass the new income figures and a boolean flag for whether to wipe expenses. The function derives the current cycle's start date internally (same logic as `cycleStartDate()` utility) and soft-deletes expenses with `date >= cycleStartDate` using the existing `softDeleteExpense` path.

- **Settings screen entry point**: A "Reset Current Cycle" row is added to the Settings screen. It navigates to a dedicated Reset screen (not a modal sheet) that handles the two-step confirmation flow.

- **Two-step confirmation UI**:
  1. Step 1: show old figures vs. new figures form; user confirms figure change.
  2. Step 2 (optional): show count + list of current-cycle expenses; user chooses "Also clear expenses" or "Skip".
  Each step has its own destructive-action confirmation button styled to signal irreversibility.

- **No user-visible reset history screen**: The audit trail (old `cycle_snapshots` row) is stored in the DB for correctness but not surfaced in the UI.

- **`app/settings/` routing**: The Reset screen lives under `app/settings/` following the existing pattern of `BudgetCycleScreen`, `IncomeModeScreen`, and `RecentlyDeletedScreen`.

## Testing Decisions

- **What makes a good test**: Test the DB layer functions directly (insert new snapshot, verify `getLatestCycleSnapshot` returns the newest row; soft-delete expenses in range, verify they appear in `listDeletedExpenses`). Do not test UI state or navigation — test the data operations the UI calls. Follow the pattern in `__tests__/db.test.ts` using an in-memory SQLite driver via `makeDriver`.

- **Tests to write**:
  - `getLatestCycleSnapshot` returns the most recently *created* row when two rows share the same `cycle_start_date` (proves the ordering fix).
  - After a mid-cycle reset insert, `getLatestCycleSnapshot` returns the new figures, and the old row is still present in the DB (proves audit trail preservation).
  - `resetCurrentCycle` with `wipeExpenses: true` soft-deletes all expenses on or after the cycle start date, and those expenses appear in `listDeletedExpenses`.
  - `resetCurrentCycle` with `wipeExpenses: false` leaves all expenses untouched.
  - Expenses from a prior cycle are not soft-deleted even when `wipeExpenses: true`.

- **Prior art**: `__tests__/db.test.ts` — specifically the `insertCycleSnapshot / getLatestCycleSnapshot` and `softDeleteExpense / listDeletedExpenses` describe blocks.

## Out of Scope

- Per-category expense wipe (all or nothing).
- User-visible reset history screen.
- Resetting Category Limits or Budget Carryover settings.
- Resetting Recurring Rules.
- Affecting expenses or snapshots from past Budget Cycles.
- Undo / re-restore of the income figure change itself (only expenses are recoverable via Recently Deleted).

## Further Notes

- The existing test `'rejects duplicate cycle_start_date'` in `__tests__/db.test.ts` must be updated to reflect the new behaviour (duplicate dates now allowed; the test should be replaced with the ordering test described above).
- The GLOSSARY.md definition of **Cycle Snapshot** should be updated to note that multiple snapshots per `cycle_start_date` are possible after a mid-cycle reset, and that the latest (by `created_at`) is always authoritative for that cycle.
