---
name: project-gastosgo-bugs
description: GastosGo beta test 2026-11-05 bug batch patterns — recurring bug hotspots, shared constant issue, file conflict clusters
metadata:
  type: project
---

Bug batch beta-test-2026-11-05 produced 15 tasks from 21 bugs, written to `docs/tasks/bug-1/`.

**Why:** First beta cycle on v1.0.0 (commit ba87090). App not production-ready.

**How to apply:** Future bug batches for this project should check these same hotspot files first; patterns repeat.

## Hotspot files (appeared in multiple tasks)

- `app/lock.tsx` — PIN logic (BUG-02, BUG-12, BUG-17): 3 separate bugs; always check all three when touching this file
- `app/(tabs)/insights.tsx` — USER_ID mismatch + 6-query block + pie interactivity + Y-axis keys (BUG-05, BUG-09, BUG-10, BUG-13)
- `lib/db/stubs.ts` — USER_ID fallback, paymentMethod missing, UTC dates, getBudgetProgress filter, newId collision (BUG-05, BUG-07, BUG-08, BUG-16, BUG-20)
- `app/onboarding/` — step counter wrong, error handling missing, mixed mode gap (BUG-06, BUG-11, BUG-15)

## Critical pattern: USER_ID mismatch (BUG-05)
Hooks used `'stub-user-001'`; DB layer wrote `'local-user'`. Fixed by `lib/constants.ts` exporting `LOCAL_USER_ID`. Any new hook or screen that queries by user ID must import from this constant.

## Task naming convention used
`TASK-{DISCIPLINE}-{NUM}.md` where discipline is FE / BE / DB and NUM is 2-digit sequential per discipline.

## Wave structure used
- Wave 0: shared constant prerequisite (1 task)
- Wave 1: all independent fixes (13 tasks, with file-conflict notes)
- Wave 2: tasks that depend on wave 1 fixes (1 task: change-PIN refactor depends on PIN length fix)
