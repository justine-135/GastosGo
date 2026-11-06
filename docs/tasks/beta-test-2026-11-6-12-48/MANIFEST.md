# Task Manifest — Beta Test 2026-11-06 12:48

**Source report:** `docs/bugs/bug-report-2026-11-06-1248.md`
**Report date:** 2026-11-06
**Bugs covered:** BUG-25, BUG-26
**Generated:** 2026-11-06

---

## Wave plan

| Wave | Task ID | Bugs | Discipline | Files | Notes |
|------|---------|------|------------|-------|-------|
| 0 | TASK-DB-01 | BUG-25, BUG-26 | `db-schema-engineer` | `lib/db/stubs.ts` | Single atomic fix; resolve design decision before editing |

No Wave 1+ — only one task, no downstream dependents.

---

## File-conflict map

| File | Task(s) |
|------|---------|
| `lib/db/stubs.ts` | TASK-DB-01 |

No conflicts.

---

## Summary table

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| DB | 0 | 1 | 0 | 0 | 1 |
| FE | — | — | — | — | 0 |
| BE | — | — | — | — | 0 |
| DEVOPS | — | — | — | — | 0 |

---

## Notes

- BUG-25 and BUG-26 share one root cause in one file — merged into a single task. Splitting would create a false sequencing dependency.
- **Design decision required before coding:** write `LOCAL_USER_ID` in `insertCategory` (option A, recommended) vs. keep `null` and add `isNull` guards to summary queries (option B). Option A removes the need for guards and keeps `getBudgetProgress` consistent; option B requires touching three query sites.
- BUG-07 (recurring rules missing `paymentMethod` column) remains open schema debt; not covered here.
- All 4 Maestro E2E tests are green — no regression task needed.
