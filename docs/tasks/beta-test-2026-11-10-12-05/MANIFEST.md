# MANIFEST — Beta Test 2026-11-10 12:05

**Source report:** `docs/bugs/bug-report-2026-11-10-1204.md`
**Date:** 2026-11-10
**Batch:** 8 (7 tasks across 3 active disciplines; DB idle)

---

## Wave Plan

### Wave 0 — Blockers (must land before Wave 1)

| Task | Bug | Discipline | Files | Notes |
|------|-----|------------|-------|-------|
| TASK-DEVOPS-01 | BUG-01 | DEVOPS | `e2e/01-smoke.yaml` | PIN-unlock unblocks reliable smoke runs |
| TASK-FE-01 | BUG-02 | FE | `app/(tabs)/_layout.tsx` | Tab deduplication unblocks all tab-navigation tasks |

Both Wave 0 tasks touch different files — they are **parallel-safe within Wave 0**.

### Wave 1 — Parallel (after Wave 0)

| Task | Bug | Discipline | Files | Notes |
|------|-----|------------|-------|-------|
| TASK-FE-03 | BUG-03 | FE | `e2e/04-navigation.yaml` | Depends on TASK-FE-01 (tabs fixed); ⚠️ see file conflict below |
| TASK-DEVOPS-02 | BUG-05 + PRD F7 | DEVOPS | `e2e/02-onboarding.yaml` | Independent |
| TASK-BE-01 | PRD F4 | BE | `lib/db/stubs.ts`, `db/queries/recurringRules.ts` | Independent |
| TASK-BE-02 | PRD F8/9 | BE | TBD (investigation) | Independent |

### Wave 2 — Depends on Wave 1

| Task | Bug | Discipline | Files | Notes |
|------|-----|------------|-------|-------|
| TASK-FE-02 | BUG-04 + PRD F6 | FE | `e2e/05-insights.yaml` (new), `app/(tabs)/insights.tsx` | Depends on TASK-FE-01 (Insights tab must be reachable) |

---

## File-Conflict Map

| File | Tasks that touch it | Action |
|------|---------------------|--------|
| `app/(tabs)/_layout.tsx` | TASK-FE-01 | No conflict — single task |
| `e2e/01-smoke.yaml` | TASK-DEVOPS-01 | No conflict — single task |
| `e2e/04-navigation.yaml` | TASK-FE-03 | No conflict — single task (but note: Batch 7 also touched this file; confirm latest is merged before assigning) |
| `e2e/02-onboarding.yaml` | TASK-DEVOPS-02 | No conflict — single task |
| `app/(tabs)/insights.tsx` | TASK-FE-02 | ⚠️ Batch 7 TASK-FE-01 and TASK-FE-02 also touched this file — confirm those fixes are merged before assigning TASK-FE-02 |
| `lib/db/stubs.ts` | TASK-BE-01 | No new conflict this batch; prior UTC-fix tasks (Batch 3/4) should be confirmed merged |
| `db/queries/recurringRules.ts` | TASK-BE-01 | No new conflict this batch |

---

## Summary Table — Tasks per Discipline per Priority

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| FE | 0 | 1 | 2 | 0 | 3 |
| BE | 0 | 0 | 2 | 0 | 2 |
| DB | 0 | 0 | 0 | 0 | 0 |
| DEVOPS | 0 | 1 | 1 | 0 | 2 |
| **Total** | **0** | **2** | **5** | **0** | **7** |

---

## Bug Coverage

| Bug | Task(s) | Status |
|-----|---------|--------|
| BUG-01 — PIN lock blocks smoke flow | TASK-DEVOPS-01 | Wave 0 |
| BUG-02 — 8 tabs instead of 4 | TASK-FE-01 | Wave 0 |
| BUG-03 — Recurring section unverified | TASK-FE-03 | Wave 1 (after FE-01) |
| BUG-04 — No Insights E2E coverage | TASK-FE-02 | Wave 2 (after FE-01) |
| BUG-05 — Notifications skip label missing | TASK-DEVOPS-02 | Wave 1 |
| PRD F4 — Recurring push + mark-as-paid | TASK-BE-01 | Wave 1 |
| PRD F6 — Charts & Insights untested | TASK-FE-02 | Wave 2 |
| PRD F7 — Push notification alerts | TASK-DEVOPS-02 | Wave 1 |
| PRD F8/9 — Offline + sync | TASK-BE-02 | Wave 1 |
| PRD F2 — Budget warning visual states | Not tasked — no flow coverage exists; add to next batch |
| PRD F10 — PIN cooldown | Not tasked — add to next batch |

---

## Identified Patterns

- **Maestro flow gap — scroll to below-fold content** (Batches 5, 6, now Batch 8): `04-navigation.yaml` likely needs a `scrollDown` before asserting the Recurring section. Same root cause as the merchant field miss in `03-add-expense.yaml`.
- **Expo Router route duplication** (new pattern, Batch 8): Explicit `Tabs.Screen` declarations in `_layout.tsx` duplicating auto-discovered routes. Check all layout files for this pattern.
- **LockScreen warm-start gap** (recurring): Smoke and navigation flows that use `stopApp: false` must guard against LockScreen appearing. This was surfaced before in Batch 5 (BUG-02) and again here.

## Flagged Risks

- **TASK-FE-01** (tab deduplication): If the `_layout.tsx` fix requires removing `Tabs.Screen` declarations that carry icon/label customizations, those customizations must be preserved via `tabBarIcon`/`tabBarLabel` on the remaining single declaration. Dropping them silently would remove icons from the tab bar.
- **TASK-FE-02** (Insights flow): The `slice.data.id` null-cast issue from Batch 7 TASK-FE-02 may still be live if that batch's fixes were not merged. Confirm before writing `tapOn` slice assertions — a null-id tap could crash the app mid-flow rather than asserting the detail view.
