# Bug Batch: beta-test-2026-11-05 — Task Manifest

**Source report:** `docs/bugs/beta-test-2026-11-05.md`
**Total tasks:** 15 (13 FE+BE, 2 DB)
**Bugs covered:** BUG-01 through BUG-21 (21 bugs → 15 tasks; some bugs share a file or discipline)

---

## Wave 0 — Must land first (blocks all USER_ID consumers)

| Task | Bug | Severity | Discipline | File(s) |
|------|-----|----------|------------|---------|
| [TASK-BE-01](TASK-BE-01.md) | BUG-05 | Critical | BE | `lib/constants.ts` (new), `lib/db/stubs.ts`, `hooks/useExpenses.ts`, `hooks/useBudgets.ts`, `hooks/useRecurring.ts`, `hooks/useSavings.ts`, `app/(tabs)/insights.tsx` |

---

## Wave 1 — Parallel after Wave 0

Tasks within this wave touch distinct files and can be assigned to agents simultaneously.

### Critical

| Task | Bug | Severity | Discipline | File(s) |
|------|-----|----------|------------|---------|
| [TASK-FE-01](TASK-FE-01.md) | BUG-01 | Critical | FE | `app/_layout.tsx` |
| [TASK-FE-02](TASK-FE-02.md) | BUG-02 | Critical | FE | `app/lock.tsx` |
| [TASK-FE-03](TASK-FE-03.md) | BUG-04 | Critical | FE | `app/_layout.tsx` |
| [TASK-BE-02](TASK-BE-02.md) | BUG-03 | Critical | BE | `app/onboarding/index.tsx` |

> Note: TASK-FE-01 and TASK-FE-03 both touch `app/_layout.tsx` — assign to the same agent or sequence them.

### High

| Task | Bug | Severity | Discipline | File(s) |
|------|-----|----------|------------|---------|
| [TASK-FE-04](TASK-FE-04.md) | BUG-06 | High | FE | `app/onboarding/budget.tsx` |
| [TASK-DB-01](TASK-DB-01.md) | BUG-07 | High | DB | `lib/db/schema.ts`, migration, `lib/db/stubs.ts` |
| [TASK-BE-03](TASK-BE-03.md) | BUG-08 | High | BE | `app/modals/add-recurring.tsx`, `lib/db/stubs.ts` |
| [TASK-BE-04](TASK-BE-04.md) | BUG-09 | High | BE | `app/(tabs)/insights.tsx` |
| [TASK-FE-05](TASK-FE-05.md) | BUG-10 | High | FE | `app/(tabs)/insights.tsx` |
| [TASK-FE-06](TASK-FE-06.md) | BUG-11 | High | FE | `app/onboarding/income.tsx` |

> Note: TASK-BE-04 and TASK-FE-05 both touch `app/(tabs)/insights.tsx` — assign to the same agent or sequence them. TASK-BE-03 and TASK-DB-01 both touch `lib/db/stubs.ts` — assign to the same agent or sequence them.

### Medium

| Task | Bug | Severity | Discipline | File(s) |
|------|-----|----------|------------|---------|
| [TASK-FE-08](TASK-FE-08.md) | BUG-13 | Medium | FE | `app/(tabs)/insights.tsx` |
| [TASK-FE-09](TASK-FE-09.md) | BUG-14 | Medium | FE | `app/(tabs)/expenses.tsx` |
| [TASK-FE-10](TASK-FE-10.md) | BUG-15 | Medium | FE | `app/onboarding/index.tsx`, `app/onboarding/income.tsx`, `app/onboarding/budget.tsx` |
| [TASK-DB-02](TASK-DB-02.md) | BUG-16 | Medium | DB | `lib/db/stubs.ts` |
| [TASK-BE-05](TASK-BE-05.md) | BUG-17 | Medium | BE | `app/lock.tsx` |

> Note: TASK-FE-02, TASK-FE-07, and TASK-BE-05 all touch `app/lock.tsx` — assign to the same agent or sequence them. TASK-FE-10 and TASK-BE-02 both touch `app/onboarding/index.tsx` — assign to the same agent.

### Low

| Task | Bug | Severity | Discipline | File(s) |
|------|-----|----------|------------|---------|
| [TASK-FE-11](TASK-FE-11.md) | BUG-18 | Low | FE | `app/(tabs)/_layout.tsx` |
| [TASK-FE-12](TASK-FE-12.md) | BUG-19 | Low | FE | `app/(tabs)/expenses.tsx` |
| [TASK-BE-06](TASK-BE-06.md) | BUG-20 | Low | BE | `lib/db/stubs.ts` |
| [TASK-FE-13](TASK-FE-13.md) | BUG-21 | Low | FE | `app/settings.tsx` |

---

## Wave 2 — Depends on Wave 1

| Task | Bug | Severity | Discipline | Depends On | File(s) |
|------|-----|----------|------------|------------|---------|
| [TASK-FE-07](TASK-FE-07.md) | BUG-12 | High | FE | TASK-FE-02 | `app/lock.tsx` |

---

## File conflict map (same-file tasks requiring sequencing or single-agent assignment)

| File | Tasks |
|------|-------|
| `app/_layout.tsx` | TASK-FE-01, TASK-FE-03 |
| `app/lock.tsx` | TASK-FE-02, TASK-FE-07, TASK-BE-05 |
| `app/(tabs)/insights.tsx` | TASK-BE-04, TASK-FE-05, TASK-FE-08 |
| `app/onboarding/index.tsx` | TASK-BE-02, TASK-FE-10 |
| `app/onboarding/budget.tsx` | TASK-FE-04, TASK-FE-10 |
| `lib/db/stubs.ts` | TASK-BE-03, TASK-BE-06, TASK-DB-01, TASK-DB-02 |

---

## Summary by discipline and severity

| | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| FE | 3 | 3 | 3 | 4 | **13** |
| BE | 1 | 2 | 1 | 1 | **5** |
| DB | 0 | 1 | 1 | 0 | **2** |
| **Total** | **4** | **6** | **5** | **5** | **20** |

> BUG-05 produces 1 task (TASK-BE-01) that covers 7 files; counted once under BE Critical.
