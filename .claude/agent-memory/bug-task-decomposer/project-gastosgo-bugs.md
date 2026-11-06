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

## Hotspot files (appeared in multiple tasks across both batches)

- `app/lock.tsx` — PIN logic (BUG-02, BUG-12, BUG-17, BUG-21): 4 bugs; always check all when touching this file
- `app/(tabs)/insights.tsx` — USER_ID mismatch + N-query block + pie interactivity + Y-axis keys (BUG-05, BUG-09, BUG-10, BUG-13)
- `lib/db/stubs.ts` — USER_ID fallback, paymentMethod hardcoded, UTC dates, getBudgetProgress filter, newId collision (BUG-05, BUG-07, BUG-08, BUG-16, BUG-20)
- `app/onboarding/` — step counter wrong, error handling missing, mixed mode gap, sub-route gap (BUG-04, BUG-06, BUG-11, BUG-15)
- `app/_layout.tsx` — cold-start race + sub-route declarations (BUG-01, BUG-04)

## Critical pattern: USER_ID mismatch (BUG-05, BUG-16, BUG-25 — recurring across all batches)
Hooks used `'stub-user-001'`; DB layer wrote `'local-user'`. All data queries returned empty. Fix: export `LOCAL_USER_ID` from `lib/constants.ts`. Any new hook or query must import from this constant. This was Wave 0 (blocker) in both batches.
Batch 3 variant: WHERE clause on categoriesTable also needs `or(eq(...userId), isNull(...userId))` because seeded categories have userId = null. The drizzle-orm `isNull` and `or` imports must be added to stubs.ts whenever touching category queries.

## Pattern: schema lags TypeScript type layer (Batch 3)
BUG-28 (monthlySalary) and BUG-07 (paymentMethod on recurring_rules): InsertXInput type carried a field the Drizzle schema never received. Convention needed: schema column and TS type must be updated in the same PR.

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
