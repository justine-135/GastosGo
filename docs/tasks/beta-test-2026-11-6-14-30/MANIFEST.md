# MANIFEST — Beta Test 2026-11-06 14:30

**Source report:** `docs/bugs/bug-report-2026-11-06-1430.md`
**Commit analyzed:** f38cd44
**Date:** 2026-11-06
**Total tasks:** 9 across 4 discipline files

---

## Wave Plan

### Wave 0 — Blockers (must complete before anything else)

| Task ID | Bug(s) | Discipline | Files |
|---------|--------|------------|-------|
| TASK-DB-01 | BUG-28 | DB | `db/schema/profiles.ts`, `drizzle/` |
| TASK-DB-03 | BUG-27 | DB | `db/seed.ts`, `db/migrate.ts` |

**Why Wave 0:** TASK-DB-01 is a hard prerequisite for TASK-BE-03 (the column must exist before the write path is wired). TASK-DB-03 prevents a latent FK crash on first profile insert; sequencing it here ensures the seed is in place before any BE or FE agent exercises `insertProfile`.

---

### Wave 1 — Parallel (no inter-task dependencies within this wave)

All Wave 1 tasks can run in parallel EXCEPT those sharing `lib/db/stubs.ts` — see file-conflict map below.

| Task ID | Bug(s) | Discipline | Files |
|---------|--------|------------|-------|
| TASK-BE-01 | BUG-16 | BE | `lib/db/stubs.ts` |
| TASK-BE-02 | BUG-25 | BE | `lib/db/stubs.ts` |
| TASK-BE-03 | BUG-28 | BE | `lib/db/stubs.ts` |
| TASK-BE-04 | BUG-29 | BE | `hooks/useRecurring.ts` |
| TASK-DB-02 | BUG-07 | DB | `db/schema/recurringRules.ts`, `drizzle/` |

**stubs.ts conflict:** TASK-BE-01, TASK-BE-02, and TASK-BE-03 all touch `lib/db/stubs.ts`. Assign all three to the same agent in a single session, ordered BE-01 → BE-02 → BE-03 (imports added once, then WHERE clauses patched, then rowToProfile fixed).

TASK-BE-04 and TASK-DB-02 touch different files and are fully parallel-safe.

---

### Wave 2 — Depend on Wave 1

| Task ID | Bug(s) | Discipline | Depends on | Files |
|---------|--------|------------|------------|-------|
| TASK-FE-01 | BUG-28 (FE verify) | FE | TASK-DB-01, TASK-BE-03 | `app/onboarding/income.tsx`, `app/onboarding/budget.tsx` |
| TASK-FE-02 | BUG-28 (UI verify) | FE | TASK-DB-01, TASK-BE-03 | Dashboard screen |
| TASK-DEVOPS-01 | BUG-07 (write path) | DEVOPS | TASK-DB-02, TASK-BE-01/02/03 | `lib/db/stubs.ts` |

**Note on TASK-FE-01 and TASK-FE-02:** These are verification tasks — the FE param-passing code is already correct. They exist to confirm end-to-end behavior once the DB and BE layers are fixed. If the team prefers, they can be folded into the TASK-BE-03 acceptance check and dropped as separate tasks.

---

## File-Conflict Map

Files touched by more than one task:

| File | Tasks that touch it | Action |
|------|--------------------|----|
| `lib/db/stubs.ts` | TASK-BE-01, TASK-BE-02, TASK-BE-03, TASK-DEVOPS-01 | Assign TASK-BE-01/02/03 to the same agent in one session. TASK-DEVOPS-01 must run after all three BE tasks complete. |
| `drizzle/` (migrations) | TASK-DB-01, TASK-DB-02 | Both generate new migration files. Assign to the same DB agent session to avoid migration number conflicts. |

---

## Summary Table — Tasks per Discipline per Priority

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| BE | 0 | 3 | 1 | 0 | 4 |
| DB | 0 | 1 | 1 | 1 | 3 |
| FE | 0 | 2 | 0 | 0 | 2 |
| DEVOPS | 0 | 0 | 0 | 1 | 1 |
| **Total** | **0** | **6** | **2** | **1** | **9** |

---

## Recommended Execution Order

1. **DB agent** — run TASK-DB-01, TASK-DB-02, TASK-DB-03 together (same agent, same session). DB-01 and DB-03 are Wave 0 blockers; DB-02 is independent but cheap to bundle.
2. **BE agent** — after DB-01 and DB-03 land, run TASK-BE-01 → TASK-BE-02 → TASK-BE-03 in one session (same file), then TASK-BE-04 in parallel (different file).
3. **FE agent** — after BE-01/02/03 land, run TASK-FE-01 and TASK-FE-02 as a verification pass.
4. **DEVOPS agent** — after DB-02 and all BE tasks land, run TASK-DEVOPS-01.

---

## Identified Patterns

- **NULL userId mismatch is systemic.** BUG-16 and BUG-25 are the same root cause as the BUG-05 pattern fixed in prior batches (see project memory). The fix was recorded in the bug ledger but never applied to `lib/db/stubs.ts`. All future WHERE clauses on `categoriesTable` must use `or(eq(...userId), isNull(...userId))`.
- **Schema lags the type layer.** BUG-28 (monthlySalary) and BUG-07 (paymentMethod on recurring_rules) are both cases where the TypeScript `InsertXInput` type carried a field that the Drizzle schema never received. Add a convention: schema column and TS type must be updated in the same PR.
- **Seed is incomplete.** `seedDefaultCategories` runs but `seedLocalUser` does not. This is the third seed-related gap across bug batches.

## Flagged Risks

- **TASK-DB-01 migration must not break existing installs.** The `monthly_salary` column is nullable with no default, which is correct. Confirm Drizzle's expo-sqlite migrator handles ALTER TABLE ADD COLUMN for nullable columns on existing databases (it does for SQLite — `ALTER TABLE ... ADD COLUMN` with no NOT NULL constraint is safe).
- **stubs.ts is a hot file.** Four tasks touch it this wave. If the BE agent session is interrupted mid-edit, the file may be left in an inconsistent import state. Recommend the BE agent commit after each task or at minimum run `tsc --noEmit` before moving to the next.
- **BUG-27 (FK constraint) is latent, not crashing today.** TASK-DB-03 is Wave 0 to prevent a future regression if FK enforcement is ever enabled — not because it is currently user-visible.
