Status: ready-for-agent

# Spec: Per-Cycle Income Snapshot

## Problem Statement

When a user changes their monthly salary or expected savings between months, the app loses the ability to correctly calculate the Savings Gap for past Budget Cycles. All historical calculations silently shift to reflect the new income figures, making past months appear different from how the user actually lived them.

Additionally, the app gives the user no structured moment to confirm their income at the start of a new cycle — changes only happen if the user remembers to visit Settings.

## Solution

On the first app open of each new Budget Cycle, the app detects the cycle boundary, prompts the user to review and confirm their income figures (pre-filled with last cycle's values), and then records an immutable Cycle Snapshot for that cycle. All Savings Gap calculations — current and historical — use the snapshot for the relevant cycle, not the live settings.

## User Stories

1. As a user, I want the app to detect when a new Budget Cycle has started, so that I am prompted to review my income without having to remember to do it myself.
2. As a user, I want to be shown my previous cycle's income figures as defaults in the new-cycle prompt, so that confirming an unchanged salary takes one tap.
3. As a user, I want to confirm my income figures at the start of each cycle, so that the Savings Gap for that cycle is based on what I actually earned.
4. As a user using Salary Mode, I want to update my Monthly Salary at the start of a new cycle, so that a pay rise or cut is reflected from the correct month.
5. As a user using Mixed Mode, I want to update both my Salary and Freelance/Other income at the start of a new cycle, so that irregular freelance months are recorded accurately.
6. As a user using Target Mode, I want to confirm or update my Savings Target at the start of a new cycle, so that my goal for that cycle is locked in.
7. As a user, I want the new-cycle prompt to require an explicit confirmation (not just a swipe-away), so that I know the snapshot has been intentionally recorded.
8. As a user, I want confirming the prompt to also update my Settings screen, so that my income figures in Settings always reflect the latest confirmed values.
9. As a user, I want the Savings Gap on the Home screen to use the income figures I confirmed at the start of the current cycle, so that mid-cycle edits in Settings do not silently change historical calculations.
10. As a user, I want mid-cycle changes to income in Settings to take effect only from the next cycle, so that the current cycle's Savings Gap remains stable.
11. As a user, I want expenses from before the current Budget Cycle start date to be excluded from the current Savings Gap calculation, so that the cycle boundary is respected.
12. As a user, I want a Budget Carryover amount to be computed lazily from the previous cycle's unused Category Limit, so that I do not need to manually carry it over.
13. As a user, I want soft-deleted expenses that are restored to count toward the cycle they were originally logged in, not the current one, so that restoring an old expense does not distort this month's Savings Gap.

## Implementation Decisions

- **New `cycle_snapshots` table**: stores one row per Budget Cycle with the cycle's start date and the income figures confirmed by the user (income_mode, monthly_salary, freelance_income, expected_savings, savings_target). The row is immutable after creation.

- **Cycle boundary detection (pure function)**: a function `needsNewCycleSnapshot(today, cycleDay, lastSnapshotStartDate)` returns a boolean. Called on every app open. No side effects — detection is separated from snapshot creation so it is easily testable.

- **Cycle start date computation**: given today's date and `budgetCycleDay`, the current cycle's start date is the most recent past occurrence of that day-of-month. If today is the start day, the cycle started today.

- **New-cycle prompt**: a modal shown immediately after the cycle boundary is detected, before the main app UI is interactive. Displays the relevant income fields for the current Income Mode, pre-filled from the previous Cycle Snapshot (or AppSettings on first cycle). Requires an explicit "Looks good" / "Save changes" confirmation — cannot be dismissed without tapping a button.

- **Snapshot creation**: triggered by the user confirming the prompt. Writes one row to `cycle_snapshots` and also updates `AppSettings` to keep Settings in sync.

- **`computeGap` unchanged**: already accepts a `GapInput` struct. Callers switch from passing live `AppSettings` fields to passing the current Cycle Snapshot's fields. No changes to the pure function itself.

- **Expense filtering by cycle**: `listExpenses` and total-expense aggregation queries gain a `since` date parameter (the cycle start date). Callers pass the current cycle's start date. The existing `date` column on expenses is used — no schema change to expenses.

- **Budget Carryover**: computed lazily at read time as `previousCycleCategoryLimit − previousCycleCategorySpend`. Requires querying expenses filtered to the previous cycle's date range. No stored carryover column needed for MVP.

- **Settings mid-cycle edits**: `saveSettings` continues to update `AppSettings` as today. The Savings Gap display reads from the current Cycle Snapshot, not live settings, so mid-cycle edits have no immediate effect on the Home screen. They will appear in the next cycle's prompt pre-fill.

- **Migration**: add `cycle_snapshots` table via the existing `runMigrations` guard pattern (try/catch ALTER TABLE or CREATE TABLE IF NOT EXISTS).

- **First-cycle bootstrap**: if no Cycle Snapshot exists for the current cycle (fresh install after onboarding, or first cycle after this feature ships), the app creates one silently using the current `AppSettings` values without prompting — the user just set those in onboarding.

## Testing Decisions

Good tests verify observable behaviour from the outside — not which internal function was called, but what the user/DB state looks like after an interaction.

**Primary seam — pure functions** (highest, cheapest):
- `needsNewCycleSnapshot(today, cycleDay, lastSnapshotDate)` — test date arithmetic edge cases: same day as cycle start, day before, first ever cycle (no prior snapshot), cycle day = 31 in a short month.
- `computeGap(input)` — already tested; extend with snapshot-sourced inputs to confirm callers pass the right fields.
- `cycleStartDate(today, cycleDay)` — test month boundaries, leap years, day-of-month overflow.

**Secondary seam — DB layer**:
- Insert a Cycle Snapshot then read it back; confirm immutability (no update path exposed).
- `listExpenses` with a `since` date — confirm expenses before the cycle start are excluded, expenses on the start date are included.
- Carryover computation — seed two cycles of expenses and confirm the carryover amount is correct.

Prior art for DB-layer tests: none exist yet in this repo. Follow the same synchronous `DbDriver` pattern used in `src/db/` — tests can construct an in-memory SQLite instance via `getDb` with a temp path.

## Out of Scope

- Multi-cycle navigation in History and Budgets tabs (post-MVP).
- Custom Payment Method values beyond Cash, GCash, Card, Others (post-MVP).
- Editing or deleting a past Cycle Snapshot.
- Recurring Rules, PIN/Biometric Lock, Charts/Insights (placeholder screens).
- Dark mode.

## Further Notes

- ADR 0004 (`docs/adr/0004-per-cycle-income-snapshot.md`) records the trade-off between immutable per-cycle snapshots and updating settings in place.
- The `cycle_snapshots` table does not need a Supabase sync strategy for MVP — the Sync Queue can be extended to cover it in a later release.
- `budgetCycleDay` stays in `AppSettings` only (not in the snapshot), since changing the cycle day mid-year is a separate, undesigned feature.
