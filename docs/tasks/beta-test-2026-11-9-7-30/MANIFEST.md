# Task Manifest — Beta Test 2026-11-09 07:30

**Source report:** `docs/bugs/bug-report-2026-11-09-0730.md`
**Report date:** 2026-11-09
**Session:** Full E2E Maestro run — flows 01-smoke, 02-onboarding, 03-add-expense, 04-navigation
**Result:** 3/4 flows passed · 3 bugs · 7 PRD acceptance criteria gaps (untested, not filed as tasks)

---

## Wave Plan

| Wave | Task ID | Bug | Discipline | Files | Notes |
|------|---------|-----|------------|-------|-------|
| Wave 0 | TASK-BE-01 | BUG-02 | BE | `lib/db/stubs.ts`, `db/queries/expenses.ts` | Investigation — must resolve before TASK-FE-02 can be confirmed as a code fix |
| Wave 1 | TASK-FE-01 | BUG-03 | FE | `app/onboarding/notifications.tsx` | Independent — parallel-safe |
| Wave 1 | TASK-DEVOPS-01 | BUG-01 | DEVOPS | `e2e/04-navigation.yaml` | Independent — parallel-safe |
| Wave 1 | TASK-DEVOPS-02 | BUG-02 | DEVOPS | `e2e/03-add-expense.yaml` | Independent of BE investigation — fix YAML regardless |
| Wave 2 | TASK-FE-02 | BUG-02 | FE | `app/(tabs)/index.tsx` | Depends on TASK-BE-01 outcome and product decision on display format |

**Wave 0** must run first: TASK-BE-01 determines whether BUG-02 is a data-layer bug, a form-submit bug, or purely a Maestro flow gap. Its outcome gates whether TASK-FE-02 requires a code change.

**Wave 1** tasks (TASK-FE-01, TASK-DEVOPS-01, TASK-DEVOPS-02) touch disjoint files and can run in parallel with each other and with Wave 0.

**Wave 2**: TASK-FE-02 should proceed after TASK-BE-01 concludes and product confirms the display format (`merchant` only vs. `merchant · category`).

---

## File-Conflict Map

| File | Tasks that touch it |
|------|---------------------|
| `app/onboarding/notifications.tsx` | TASK-FE-01 only |
| `app/(tabs)/index.tsx` | TASK-FE-02 only |
| `lib/db/stubs.ts` | TASK-BE-01 only (read + possible fix) |
| `db/queries/expenses.ts` | TASK-BE-01 only (read) |
| `e2e/04-navigation.yaml` | TASK-DEVOPS-01 only |
| `e2e/03-add-expense.yaml` | TASK-DEVOPS-02 only |

No file conflicts in this batch. All tasks can be assigned to separate agents without sequencing constraints, subject to the Wave 0 investigation gate on TASK-FE-02.

---

## Summary Table

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| FE | 0 | 0 | 2 | 0 | 2 |
| BE | 0 | 0 | 1 | 0 | 1 |
| DB | — | — | — | — | 0 |
| DEVOPS | 0 | 0 | 2 | 0 | 2 |
| **Total** | **0** | **0** | **5** | **0** | **5** |

---

## PRD Coverage Gaps (not filed as tasks — untested this session)

These criteria were not exercised by any passing flow. File as separate tasks when flows covering them are ready:

- Feature 2: Budget progress bar 80%/100% visual thresholds
- Feature 4: Recurring expense creation, Mark as Paid, reminder snooze
- Feature 6: Insights tab charts (flow 04 failed before reaching it)
- Feature 7: Push notification delivery and budget alerts
- Feature 8/9: Offline expense logging, sync queue, conflict resolution
- Feature 10: PIN lockout (5 attempts, 30 s cooldown) + biometric fallback
