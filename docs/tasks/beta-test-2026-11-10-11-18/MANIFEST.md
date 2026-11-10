# Task Manifest — Code Review 2026-11-10 11:18:38

**Source report:** `docs/code-review/2026-11-10_11-18-38/review.md`
**Report date:** 2026-11-10
**Generated:** 2026-11-10
**Disciplines with tasks:** FE only (BE, DB, DEVOPS — no tasks this batch)

---

## Wave Plan

### Wave 0 — Blockers
None. No task in this batch blocks another at the data or build level.

### Wave 1 — Parallel-safe (run simultaneously)

| Task ID | Title | Priority | Discipline | Files touched |
|---------|-------|----------|------------|---------------|
| TASK-FE-01 | Move pie-slice dim style + add opacity token | P2 | FE | `theme/index.ts`, `app/(tabs)/insights.styles.ts`, `app/(tabs)/insights.tsx` |
| TASK-FE-03 | Confirm splash covers _layout null-render window | P3 | FE | `app/_layout.tsx` (read-only audit), `app.json` |

### Wave 2 — Depend on Wave 1

| Task ID | Depends on | Title | Priority | Discipline | Files touched |
|---------|-----------|-------|----------|------------|---------------|
| TASK-FE-02 | TASK-FE-01 (same file — insights.tsx) | Guard slice.data.id against null before as-string cast | P1 | FE | `app/(tabs)/insights.tsx` |
| TASK-FE-04 | TASK-FE-03 (same file — _layout.tsx) | Clear _layout.tsx fallback timer on early auth resolve | P3 | FE | `app/_layout.tsx` |
| TASK-FE-05 | TASK-FE-01 (same files — theme/index.ts, insights.tsx) | Sweep codebase for hardcoded design values and replace with theme tokens | P2 | FE | `theme/index.ts`, all `*.styles.ts` + `*.tsx` under `app/`, `components/`, `features/` |

> Note: FE-02 and FE-04 are only sequenced because they share files with FE-01 and FE-03 respectively. If the same agent handles FE-01 + FE-02 in a single session, they can be done back-to-back without a separate wave boundary.

---

## File-Conflict Map

| File | Tasks that touch it | Action |
|------|--------------------|----|
| `app/(tabs)/insights.tsx` | TASK-FE-01, TASK-FE-02, TASK-FE-05 | Sequence FE-01 → FE-02 → FE-05, or assign all to same agent |
| `app/_layout.tsx` | TASK-FE-03 (read), TASK-FE-04 (write), TASK-FE-05 (write) | Sequence FE-03 → FE-04; FE-05 after FE-04 |
| `theme/index.ts` | TASK-FE-01, TASK-FE-05 | Sequence FE-05 after FE-01 to avoid duplicate token additions |
| `app/(tabs)/insights.styles.ts` | TASK-FE-01, TASK-FE-05 | Sequence FE-05 after FE-01 |
| `app.json` | TASK-FE-03 (read-only audit) | No conflict |
| `components/*.styles.ts`, `features/**/*.styles.ts` | TASK-FE-05 only | No conflict |

---

## Summary Table

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| FE | 0 | 1 | 2 | 2 | 5 |
| BE | — | — | — | — | 0 |
| DB | — | — | — | — | 0 |
| DEVOPS | — | — | — | — | 0 |
| **Total** | **0** | **1** | **2** | **2** | **5** |

---

## Recommended Execution Order

1. Run FE-01 and FE-03 in parallel (no shared files, both are independent).
2. After FE-01 completes, run FE-02 (touches the same `insights.tsx`).
3. After FE-03 completes, run FE-04 (touches the same `_layout.tsx`).
4. After FE-01 and FE-04 both complete, run FE-05 (codebase-wide sweep — touches `theme/index.ts` and every `.styles.ts` file).

Alternatively, assign all four tasks to a single `rn-frontend-engineer` agent and let it process them in order: FE-01 → FE-02 → FE-03 → FE-04. This avoids any merge friction.

---

## Identified Patterns

- **insights.tsx is a recurring hotspot.** This is the fourth batch that includes a task touching this file (previous: BUG-05, BUG-09, BUG-10, BUG-13). The design-token and inline-style violations are consistent with the broader "hardcoded values everywhere" pattern noted in earlier batches.
- **_layout.tsx timer / auth-gate complexity.** The root layout has accrued multiple effects for auth checking, PIN locking, and fallback timers. FE-04 is a low-risk cleanup but the cumulative complexity of this file is worth a dedicated simplification pass in a future cycle.
- **No BE/DB/DEVOPS work this batch.** The changeset was focused on Reanimated worklet fix, auth gating, and onboarding label — all purely FE concerns.
