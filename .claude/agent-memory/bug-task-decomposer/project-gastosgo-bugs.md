---
name: project-gastosgo-bugs
description: GastosGo beta test bug batch patterns — recurring hotspots, shared constant issue, file conflict clusters, discipline split history
metadata:
  type: project
---

Three bug batches processed for GastosGo as of 2026-11-06.

**Why:** App entered beta on commit ba87090 and is not yet production-ready.

**How to apply:** Future bug batches should check these hotspot files first; patterns repeat across batches.

## Batch 1 — 2026-11-05 (21 bugs, 15 tasks)
Written to `docs/tasks/bug-1/`. 3 disciplines: FE, BE, DB.

## Batch 2 — 2026-11-05 12:48 (25 bugs + 3 coverage gaps = 28 tasks)
Written to `docs/tasks/beta-test-2026-11-5-12-48/`. 4 disciplines: FE, BE, DB, DEVOPS.

## Batch 3 — 2026-11-06 14:30 (6 bugs, 9 tasks)
Written to `docs/tasks/beta-test-2026-11-6-14-30/`. 4 disciplines: FE, BE, DB, DEVOPS. Static analysis of commit f38cd44.
Key bugs: NULL-userId mismatch still in getBudgetProgress (BUG-16 — fix was ledgered but never applied), same NULL issue in Insights summary functions (BUG-25), monthlySalary never persisted to DB (BUG-28), local-user seed row missing (BUG-27), UTC date in Mark-as-Paid (BUG-29), paymentMethod missing from recurring_rules schema (BUG-07).

## Batch 4 — 2026-11-06 13:11 (3 bugs, 4 tasks)
Written to `docs/tasks/beta-test-2026-11-6-13-11/`. 4 disciplines (FE and DEVOPS empty this batch). Static analysis of commit 379bcf2.
Key bugs: BUG-30 (paymentMethod enum lowercase vs. title-case type mismatch — supersedes BUG-07), BUG-31 (advanceNextDueDate UTC offset), BUG-32 (getRulesDueWithin cutoff UTC offset).
10 bugs confirmed fixed: BUG-01, 02, 05, 16, 17, 22, 23, 24, 25, 29.

## Batch 5 — 2026-11-06 14:00 (4 bugs from full E2E Maestro run, 8 tasks)
Written to `docs/tasks/beta-test-2026-11-6-14-0/`. 4 disciplines; DB empty this batch.
Key bugs: BUG-01 (tab nav broken — all tabs render Dashboard, P0 blocker), BUG-02 (PIN security gap — content visible before lock screen, P1 security), BUG-03 (reclassified — payment method field IS present in add-expense.tsx but below fold, Maestro flow never scrolled), BUG-04 (Expo LogBox banner in all screenshots, P3).
Analyst reclassification: BUG-03 is NOT a missing field. Code inspection confirmed the field exists at lines 241-256 of add-expense.tsx. The Maestro 03-add-expense.yaml flow never scrolls the modal, so the field was invisible in screenshots. Filed as INVESTIGATION (TASK-FE-04) + Maestro flow update (TASK-BE-02).
Maestro flow flaw: 04-navigation.yaml assertions match tab bar labels (always visible), not screen content — caused false pass during BUG-01. Fix: add assertNotVisible: "Recent Transactions" after each tab tap.

## Batch 6 — 2026-11-09 07:30 (3 bugs from full E2E Maestro run, 5 tasks)
Written to `docs/tasks/beta-test-2026-11-9-7-30/`. 4 disciplines; DB empty this batch. 3/4 flows passed.
Key bugs: BUG-01 (Metro dev banner intercepts tab bar tap in 04-navigation — DEVOPS YAML fix), BUG-02 (merchant field null in Recent Transactions — 03-add-expense.yaml never scrolls to merchant field, same pattern as Batch 5 BUG-03), BUG-03 (OnboardingNotifications renders "Skip" not "Not now" — Maestro 02-onboarding.yaml expects "Not now" text, PRD violation).
Analyst note: BUG-02 merchant display is correct in app code (stubs.ts includes merchant, dashboard does merchant ?? category). Root cause is the Maestro flow never filling the merchant field (null in DB). TASK-BE-01 is an investigation before TASK-FE-02 can be confirmed.
Pattern confirmed recurring: Maestro flows not scrolling to below-fold form fields (03-add-expense.yaml). Filed across Batch 5 and Batch 6.

## Batch 7 — 2026-11-10 11:18 (5 review items, 4 tasks)
Written to `docs/tasks/beta-test-2026-11-10-11-18/`. FE only — BE/DB/DEVOPS empty this batch. Static code review of HEAD~5..HEAD.
Key items: design-token violation (opacity: 0.4 hardcoded in insights.tsx — TASK-FE-01), dim style inline in .tsx instead of .styles.ts (TASK-FE-01), slice.data.id null-pass through as-string cast (TASK-FE-02, P1), _layout.tsx dangling fallback timer (TASK-FE-04, P3), splash/null-render window investigation (TASK-FE-03, P3).
No critical bugs. FE-01 + FE-02 share insights.tsx (conflict). FE-03 + FE-04 share _layout.tsx (conflict).
Wave 0: none. Wave 1: FE-01, FE-03 (parallel). Wave 2: FE-02 (after FE-01), FE-04 (after FE-03).
New pattern confirmed: `theme/index.ts` has no `opacity` export — add `opacity.dim = 0.4` there, never inline a raw 0.x value in component or style files.

## Hotspot files (appeared in multiple tasks across both batches)

- `app/lock.tsx` — PIN logic (BUG-02, BUG-12, BUG-17, BUG-21): 4 bugs; always check all when touching this file
- `app/(tabs)/insights.tsx` — USER_ID mismatch + N-query block + pie interactivity + Y-axis keys (BUG-05, BUG-09, BUG-10, BUG-13)
- `lib/db/stubs.ts` — USER_ID fallback, paymentMethod hardcoded, UTC dates, getBudgetProgress filter, newId collision (BUG-05, BUG-07, BUG-08, BUG-16, BUG-20)
- `app/onboarding/` — step counter wrong, error handling missing, mixed mode gap, sub-route gap (BUG-04, BUG-06, BUG-11, BUG-15)
- `app/_layout.tsx` — cold-start race + sub-route declarations (BUG-01, BUG-04)

## Critical pattern: USER_ID mismatch (BUG-05, BUG-16, BUG-25 — recurring across all batches)
Hooks used `'stub-user-001'`; DB layer wrote `'local-user'`. All data queries returned empty. Fix: export `LOCAL_USER_ID` from `lib/constants.ts`. Any new hook or query must import from this constant. This was Wave 0 (blocker) in both batches.
Batch 3 variant: WHERE clause on categoriesTable also needs `or(eq(...userId), isNull(...userId))` because seeded categories have userId = null. The drizzle-orm `isNull` and `or` imports must be added to stubs.ts whenever touching category queries.

## Pattern: schema lags TypeScript type layer (Batch 3 + 4)
BUG-28 (monthlySalary) and BUG-07/BUG-30 (paymentMethod on recurring_rules): InsertXInput type carried a field the Drizzle schema never received, or schema enum values diverged from the TS type values. Convention needed: schema column, Drizzle enum, and TS type must be updated in the same PR. Drizzle migrations must include a backfill UPDATE for existing rows when enum values change.

## Pattern: UTC date strings vs. local date (Batch 3 + 4, recurring)
BUG-29 (Batch 3), BUG-31, BUG-32 (Batch 4): any `d.toISOString().slice(0,10)` in BE logic is a UTC-offset bug for UTC+8 users. Established fix: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`. Both `lib/db/stubs.ts` and `db/queries/recurringRules.ts` have duplicate implementations of `advanceNextDueDate` and `getRulesDueWithin` — always fix both files together. `db/queries/recurringRules.ts`'s `getRulesDueWithin` uses SQLite `date('now', ...)` and is safe; only the JS-side cutoff in stubs.ts is affected.

## Pattern: incomplete seed (recurring)
seedDefaultCategories runs but seedLocalUser does not (BUG-27, Batch 3). Third seed-related gap across batches. Always check that the users table has a local-user row before seeding categories.

## Task naming convention
`TASK-{DISCIPLINE}-{NN}` where discipline is FE / BE / DB / DEVOPS and NN is 2-digit sequential per discipline. All tasks in a single discipline file, not individual files.

## Wave structure used (Batch 2)
- Wave 0: shared userId constant + victory-native install (2 tasks — build and data blockers)
- Wave 1: all independent fixes (15 tasks, with file-conflict notes)
- Wave 2: tasks that depend on Wave 0/1 (11 tasks, mostly Insights screen and lock.tsx chain)

## Discipline split (Batch 2 addition)
DEVOPS added as 4th discipline: handles package.json deps, Android back-nav guards (Expo config), and Settings error handling. 3 tasks in Batch 2.

## Recurring coverage gaps (not bugs, but always present)
- Android hardware back-nav not guarded in onboarding
- Dark mode: hardcoded light hex colors throughout
- Missing npm dependencies (victory-native in Batch 2)
- Settings backup error handling absent
