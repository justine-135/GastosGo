# MANIFEST — beta-test-2026-11-6-13-11

**Source report:** `docs/bugs/bug-report-2026-11-06-1311.md`
**Session:** Full smoke test (Session 3) — static source analysis, master @ 379bcf2
**Decomposed:** 2026-11-06

---

## Wave Plan

| Wave | Task IDs | Bugs covered | Discipline | Key files |
|------|----------|--------------|------------|-----------|
| 0 — Blocker | TASK-DB-01 | BUG-30 | DB | `db/schema/recurringRules.ts`, `drizzle/` (new migration) |
| 1 — Parallel | TASK-BE-01 | BUG-30 | BE | `lib/db/stubs.ts` |
| 1 — Parallel | TASK-BE-02 | BUG-31 | BE | `lib/db/stubs.ts`, `db/queries/recurringRules.ts` |
| 1 — Parallel | TASK-BE-03 | BUG-32 | BE | `lib/db/stubs.ts` |

**Wave 0 must land first.** TASK-DB-01 defines the final enum values. TASK-BE-01, BE-02, and BE-03 can all be assigned to the same BE agent in one pass after DB-01 is merged, since they all edit `lib/db/stubs.ts`.

TASK-BE-02 also touches `db/queries/recurringRules.ts` independently of the other BE tasks — no conflict there.

---

## File-Conflict Map

| File | Task IDs that touch it | Resolution |
|------|------------------------|------------|
| `lib/db/stubs.ts` | TASK-BE-01, TASK-BE-02, TASK-BE-03 | Assign all three to the same agent; apply in order BE-01 → BE-02 → BE-03 |
| `db/schema/recurringRules.ts` | TASK-DB-01 only | No conflict |
| `drizzle/` (new migration) | TASK-DB-01 only | No conflict |
| `db/queries/recurringRules.ts` | TASK-BE-02 only | No conflict |

---

## Summary Table

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| FE | 0 | 0 | 0 | 0 | 0 |
| BE | 0 | 1 | 2 | 0 | 3 |
| DB | 0 | 1 | 0 | 0 | 1 |
| DEVOPS | 0 | 0 | 0 | 0 | 0 |
| **Total** | **0** | **2** | **2** | **0** | **4** |

---

## Notes

- BUG-30 spans DB and BE (schema fix + cast cleanup). DB-01 is the blocker; BE-01 is the follow-up cleanup. Both are P1.
- BUG-31 and BUG-32 are the same root cause (UTC vs. local date string). The fix pattern is identical — one-liner in each function. BE-02 and BE-03 can be done in a single editing pass on `lib/db/stubs.ts`. BUG-29 (now closed) established this pattern.
- `db/queries/recurringRules.ts` has a second `advanceNextDueDate`/`computeNextDate` with the same UTC bug (line 89). TASK-BE-02 covers it. The `getRulesDueWithin` in the same file uses SQLite's `date('now', ...)` and is already correct — do not change it.
- BUG-07 is superseded by BUG-30 — no separate task needed.
- BUG-28 (monthlySalary) flagged as likely stale; not decomposed into a task. Recommend a quick audit of `db/schema/profiles.ts` and the `insertProfile` migration SQL to confirm the column is present, then close BUG-28.
- 10 bugs confirmed fixed this session (BUG-01, 02, 05, 16, 17, 22, 23, 24, 25, 29) — no tasks required.
- All findings are from static analysis only; runtime-only paths (expo-local-authentication, SQLite migration idempotency on upgrade) remain uncovered.
