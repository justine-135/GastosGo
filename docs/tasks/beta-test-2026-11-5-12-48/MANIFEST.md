# Task Manifest — Beta Test 2026-11-05 12:48

**Source report:** `docs/bugs/beta-test-2026-11-05-1248.md`
**Date:** 2026-11-05
**Total tasks:** 25 (from 25 bugs + 3 coverage gaps = 28 issues; 3 coverage gaps mapped to 3 DEVOPS tasks)

---

## 1. Wave Plan

### Wave 0 — Blockers (must complete before anything else is tested)

| Task ID | Bug(s) | Discipline | Files |
|---------|--------|------------|-------|
| TASK-BE-01 | BUG-05 | BE | `lib/constants.ts`, all userId references |
| TASK-DEVOPS-01 | (gap) | DEVOPS | `package.json` |

TASK-BE-01 is a data-layer prerequisite: every query returns empty until userId is consistent. TASK-DEVOPS-01 is a build prerequisite: Metro won't start the Insights screen without `victory-native`.

---

### Wave 1 — Parallel (no inter-task dependencies)

| Task ID | Bug(s) | Discipline | Files |
|---------|--------|------------|-------|
| TASK-FE-01 | BUG-01 | FE | `app/_layout.tsx` |
| TASK-FE-04 | BUG-06 | FE | `app/onboarding/budget.tsx` |
| TASK-FE-05 | BUG-11 | FE | `app/onboarding/income.tsx` |
| TASK-FE-08 | BUG-15 | FE | `app/onboarding/` step indicator |
| TASK-FE-12 | BUG-14 | FE | `app/(tabs)/insights.tsx` or chip component |
| TASK-FE-13 | BUG-23 | FE | `MonthNavigator` component |
| TASK-FE-14 | BUG-18 | FE | `app/(tabs)/_layout.tsx` |
| TASK-FE-15 | BUG-19 | FE | List screens with `<RefreshControl>` |
| TASK-BE-02 | BUG-03 | BE | `lib/restore.ts`, `app/onboarding/index.tsx` |
| TASK-BE-03 | BUG-07 | BE | `lib/db/stubs.ts` |
| TASK-BE-05 | BUG-08 | BE | `app/add-expense.tsx`, `app/add-recurring.tsx` |
| TASK-BE-06 | BUG-22 | BE | `utils/format.ts` |
| TASK-DB-02 | BUG-25 | DB | `lib/db/stubs.ts` |
| TASK-DB-03 | BUG-20 | DB | `lib/db/stubs.ts` |
| TASK-DEVOPS-03 | (gap) | DEVOPS | settings screen, backup function |

> Note: TASK-DB-02 and TASK-DB-03 both touch `lib/db/stubs.ts` — assign to the same DB agent and sequence them (see File Conflict Map).

---

### Wave 2 — Depend on Wave 0 or Wave 1

| Task ID | Bug(s) | Discipline | Waits for | Files |
|---------|--------|------------|-----------|-------|
| TASK-FE-02 | BUG-04 | FE | TASK-FE-01 | `app/_layout.tsx`, `app/onboarding/_layout.tsx` |
| TASK-FE-03 | BUG-02 | FE | — (can run Wave 1, but must complete before TASK-FE-07) | `app/lock.tsx` |
| TASK-FE-07 | BUG-12 | FE | TASK-FE-03 | `app/lock.tsx` |
| TASK-FE-06 | BUG-21 | FE | TASK-FE-03, TASK-FE-07 | `app/lock.tsx` |
| TASK-FE-09 | BUG-17 | FE | TASK-FE-03 | `app/lock.tsx` |
| TASK-FE-10 | BUG-10 | FE | TASK-BE-01, TASK-DEVOPS-01 | `app/(tabs)/insights.tsx` |
| TASK-FE-11 | BUG-13 | FE | TASK-BE-01, TASK-DEVOPS-01 | `app/(tabs)/insights.tsx` |
| TASK-BE-04 | BUG-09 | BE | TASK-BE-01, TASK-DEVOPS-01 | `app/(tabs)/insights.tsx` |
| TASK-BE-07 | BUG-24 | BE | TASK-BE-01 | hook calling `insertCategory` |
| TASK-DB-01 | BUG-16 | DB | TASK-BE-01 | `lib/db/stubs.ts` |
| TASK-DEVOPS-02 | (gap) | DEVOPS | TASK-FE-02 | `app/onboarding/_layout.tsx` |

---

## 2. File Conflict Map

Files touched by more than one task — assign to the same agent or strictly sequence:

| File | Task IDs | Sequencing required |
|------|----------|---------------------|
| `app/lock.tsx` | TASK-FE-03, TASK-FE-06, TASK-FE-07, TASK-FE-09 | TASK-FE-03 → TASK-FE-07 → TASK-FE-06, TASK-FE-09 (TASK-FE-03 is prerequisite) |
| `app/_layout.tsx` | TASK-FE-01, TASK-FE-02 | TASK-FE-01 → TASK-FE-02 |
| `app/(tabs)/insights.tsx` | TASK-FE-10, TASK-FE-11, TASK-BE-04 | All Wave 2; assign to same agent |
| `lib/db/stubs.ts` | TASK-BE-03, TASK-DB-01, TASK-DB-02, TASK-DB-03 | Assign all DB-layer stubs tasks to DB agent; TASK-DB-01 waits for TASK-BE-01 |

---

## 3. Summary Table

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| FE | 3 | 5 | 5 | 2 | 15 |
| BE | 2 | 4 | 1 | 0 | 7 |
| DB | 0 | 0 | 1 | 2 | 3 |
| DEVOPS | 1 | 2 | 0 | 0 | 3 |
| **Total** | **6** | **11** | **7** | **4** | **28** |

> P0 count is 6 (5 from the report's Critical bugs + 1 from the victory-native build blocker).

---

## 4. Bug Coverage Cross-Reference

| Bug | Task | Discipline | Priority |
|-----|------|------------|----------|
| BUG-01 | TASK-FE-01 | FE | P0 |
| BUG-02 | TASK-FE-03 | FE | P0 |
| BUG-03 | TASK-BE-02 | BE | P0 |
| BUG-04 | TASK-FE-02 | FE | P0 |
| BUG-05 | TASK-BE-01 | BE | P0 |
| BUG-06 | TASK-FE-04 | FE | P1 |
| BUG-07 | TASK-BE-03 | BE | P1 |
| BUG-08 | TASK-BE-05 | BE | P1 |
| BUG-09 | TASK-BE-04 | BE | P1 |
| BUG-10 | TASK-FE-10 | FE | P1 |
| BUG-11 | TASK-FE-05 | FE | P1 |
| BUG-12 | TASK-FE-07 | FE | P1 |
| BUG-13 | TASK-FE-11 | FE | P2 |
| BUG-14 | TASK-FE-12 | FE | P2 |
| BUG-15 | TASK-FE-08 | FE | P2 |
| BUG-16 | TASK-DB-01 | DB | P2 |
| BUG-17 | TASK-FE-09 | FE | P2 |
| BUG-18 | TASK-FE-14 | FE | P3 |
| BUG-19 | TASK-FE-15 | FE | P3 |
| BUG-20 | TASK-DB-03 | DB | P3 |
| BUG-21 | TASK-FE-06 | FE | P3 |
| BUG-22 | TASK-BE-06 | BE | P1 |
| BUG-23 | TASK-FE-13 | FE | P2 |
| BUG-24 | TASK-BE-07 | BE | P2 |
| BUG-25 | TASK-DB-02 | DB | P3 |
| gap: victory-native | TASK-DEVOPS-01 | DEVOPS | P0 |
| gap: Android back-nav | TASK-DEVOPS-02 | DEVOPS | P1 |
| gap: Backup Now throw | TASK-DEVOPS-03 | DEVOPS | P1 |
