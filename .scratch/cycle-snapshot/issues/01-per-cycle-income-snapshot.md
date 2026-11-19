# 01: Per-Cycle Income Snapshot

**What to build:** On every app open, the app detects whether the current Budget Cycle has a confirmed income snapshot. If not and it's the first cycle ever (fresh install or first cycle after the feature ships), it creates one silently from current `AppSettings`. If it's a subsequent cycle, it shows the `NewCyclePrompt` modal — pre-filled from the previous snapshot — which requires an explicit confirmation tap before the main UI becomes interactive. Confirming writes an immutable row to `cycle_snapshots` and also updates `AppSettings`. The Home screen then uses the current cycle's snapshot income fields (not live settings) in `computeGap`, and filters expenses to the current cycle start date so pre-cycle expenses are excluded from the Savings Gap.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `cycleStartDate(today, cycleDay)` pure function: returns the most recent past occurrence of `cycleDay`; if today is `cycleDay`, returns today. Unit tests cover month boundaries, leap years, and day-of-month overflow (e.g. cycle day 31 in February).
- [ ] `needsNewCycleSnapshot(today, cycleDay, lastSnapshotStartDate)` pure function: returns true when `cycleStartDate(today, cycleDay)` is after `lastSnapshotStartDate`, or when `lastSnapshotStartDate` is null (no snapshot ever). Unit tests cover: same day as cycle start, day before, first ever cycle, cycle day 31 in a short month.
- [ ] `cycle_snapshots` table added via the existing `runMigrations` guard pattern. Columns: `id`, `cycle_start_date` (TEXT, unique), `income_mode`, `monthly_salary`, `freelance_income`, `expected_savings`, `savings_target`, `created_at`. No update path is exposed.
- [ ] `insertCycleSnapshot` and `getLatestCycleSnapshot` DB functions in `src/db/`. DB-layer tests: insert then read-back; confirm a second insert for the same `cycle_start_date` is rejected.
- [ ] `RootLayout` calls `needsNewCycleSnapshot` on every app open. If true and no prior snapshot exists (first cycle ever), creates a snapshot silently from `AppSettings` without showing the modal.
- [ ] `NewCyclePrompt` modal shown from `RootLayout` when `needsNewCycleSnapshot` is true and a prior snapshot exists. Displays the income fields relevant to the current `IncomeMode`, pre-filled from the previous snapshot. Cannot be dismissed without tapping the confirm button. On confirm: calls `insertCycleSnapshot` + `saveSettings` to keep Settings in sync.
- [ ] `listExpenses` gains an optional `since` date parameter. When provided, excludes expenses whose `date` is before `since`. Existing callers pass nothing and are unaffected. DB-layer test: expenses before `since` excluded; expense on `since` date included.
- [ ] `HomeScreen` loads the current cycle snapshot via `getLatestCycleSnapshot`, derives the cycle start date via `cycleStartDate`, passes `since` to `listExpenses`, and passes the snapshot's income fields into `computeGap`. `computeGap` itself is unchanged.
