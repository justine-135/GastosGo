# MANIFEST — Beta Test 2026-11-10 12:10

**Source report:** `docs/bugs/bug-report-2026-11-10-1210.md`
**Date:** 2026-11-10
**Commit:** `e7a2a2a`
**Session type:** Static code review (no live Maestro run)

---

## Wave Plan

All five tasks are independent — no shared files, no cross-task dependencies. A single wave suffices.

| Wave | Task ID | Bug ref | Description | Discipline | Files |
|------|---------|---------|-------------|------------|-------|
| 1 | TASK-FE-01 | BUG-35 | Fix formatDate UTC+8 off-by-one | FE | `utils/format.ts` |
| 1 | TASK-FE-02 | BUG-34 | Guard orphaned ACTIVE section header | FE | `app/(tabs)/expenses.tsx` |
| 1 | TASK-FE-03 | BUG-36 | Investigate missing MonthNavigator on Dashboard | FE | `app/(tabs)/index.tsx` |
| 1 | TASK-FE-04 | BUG-37 | Extend budget cycle day picker to 31 | FE | `app/settings.tsx` |
| 1 | TASK-FE-05 | BUG-33 | Clean up double-falsy savings target pattern | FE | `app/onboarding/budget.tsx` |

Wave 0: none — no blockers this batch.
Wave 1: all five tasks run in parallel.
Wave 2+: none required.

---

## File-Conflict Map

No file conflicts this batch. Each task touches a distinct file.

| File | Tasks |
|------|-------|
| `utils/format.ts` | TASK-FE-01 only |
| `app/(tabs)/expenses.tsx` | TASK-FE-02 only |
| `app/(tabs)/index.tsx` | TASK-FE-03 only |
| `app/settings.tsx` | TASK-FE-04 only |
| `app/onboarding/budget.tsx` | TASK-FE-05 only |

---

## Summary Table

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| FE | 0 | 1 | 2 | 2 | 5 |
| BE | 0 | 0 | 0 | 0 | 0 |
| DB | 0 | 0 | 0 | 0 | 0 |
| DEVOPS | 0 | 0 | 0 | 0 | 0 |
| **Total** | **0** | **1** | **2** | **2** | **5** |

---

## Notes

- BUG-35 (TASK-FE-01) is the highest-priority fix in this batch — affects every UTC+8 user reading any historical date. One-line change. Assign first if the agent is not running in parallel.
- BUG-36 (TASK-FE-03) is filed as INVESTIGATION. The agent must confirm design intent with PM before writing any code. If MonthNavigator is to be added, a follow-up BUG task should be filed.
- This batch is FE-only. BE, DB, and DEVOPS agents are idle.
- Session was static analysis only — runtime-only issues (native crashes, Reanimated worklets, deep links) not covered.
- BUG-30 (enum mismatch) remains open/latent from prior sessions; not in scope here.
