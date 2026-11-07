# MANIFEST — beta-test-2026-11-6-14-0

**Source report:** `docs/bugs/bug-report-2026-11-06-1358.md`
**Report date:** 2026-11-06 13:58
**Session:** Full E2E Maestro run — all 4 flows (01-smoke, 02-onboarding, 03-add-expense, 04-navigation)
**Task files written:** 2026-11-06 ~14:00

---

## Analyst note — BUG-03 reclassified

The bug report states "payment method field missing from Add Expense modal." Code inspection of `app/modals/add-expense.tsx` (lines 241–256) shows the field IS present in the JSX and is not behind a conditional. The Maestro 03-add-expense flow never scrolls down in the modal, so the screenshot only captured fields above the fold (Amount, Category, Merchant, Notes). The field is present but un-tested by E2E. BUG-03 is reclassified from BUG to INVESTIGATION (TASK-FE-04) + a Maestro flow update (TASK-BE-02).

---

## Wave plan

### Wave 0 — Blockers (must fix first)

| Task ID | Bug | Description | Discipline | Files |
|---------|-----|-------------|-----------|-------|
| TASK-FE-01 | BUG-01 | Fix tab navigation — all tabs stuck on Dashboard | FE | `app/(tabs)/_layout.tsx`, `app/(tabs)/expenses.tsx`, `app/(tabs)/budgets.tsx`, `app/(tabs)/insights.tsx`, `app/(tabs)/index.tsx` |

TASK-FE-01 is a hard blocker: Budgets and Insights screens are entirely unreachable until it is fixed, making ~40% of PRD acceptance criteria untestable.

---

### Wave 1 — Parallel (run after Wave 0, all independent of each other)

| Task ID | Bug | Description | Discipline | Files |
|---------|-----|-------------|-----------|-------|
| TASK-FE-02 | BUG-01 | Fix Maestro 04-navigation flow assertions | FE | `e2e/04-navigation.yaml` |
| TASK-FE-03 | BUG-02 | Add auth overlay — hide content until PIN verified | FE | `app/_layout.tsx`, `app/lock.tsx` |
| TASK-FE-04 | BUG-03 | Investigate payment method field visibility | FE | `app/modals/add-expense.tsx`, `e2e/03-add-expense.yaml` |
| TASK-FE-05 | BUG-04 | Suppress Expo LogBox banner | FE | `app/_layout.tsx` |
| TASK-BE-01 | — | Audit PRD feature business logic (Budgets, Insights, Push, Recurring, PIN, Sync) | BE | `app/(tabs)/budgets.tsx`, `app/(tabs)/insights.tsx`, `lib/notifications.ts`, `stores/useSyncStore.ts` |
| TASK-DEVOPS-01 | BUG-04 | Suppress Expo LogBox banner via env flag | DEVOPS | `app/_layout.tsx` |

> TASK-FE-05 and TASK-DEVOPS-01 both address BUG-04 from different angles. Assign to the same agent or coordinate: DEVOPS identifies the suppression mechanism; FE may fix the underlying warning. See file conflict note below.

---

### Wave 2 — Depends on Wave 1

| Task ID | Depends on | Description | Discipline | Files |
|---------|-----------|-------------|-----------|-------|
| TASK-BE-02 | TASK-FE-04 | Update 03-add-expense flow: scroll + assert payment method | BE | `e2e/03-add-expense.yaml` |

---

## File-conflict map

| File | Task IDs that touch it | Risk |
|------|----------------------|------|
| `app/_layout.tsx` | TASK-FE-03, TASK-FE-05, TASK-DEVOPS-01 | Three tasks touch this file. TASK-FE-03 adds auth overlay state; TASK-FE-05 / TASK-DEVOPS-01 add LogBox suppression. Changes are in different sections of the file and can be merged, but assign to the same agent or sequence carefully. |
| `e2e/04-navigation.yaml` | TASK-FE-02 | Single task — no conflict. |
| `e2e/03-add-expense.yaml` | TASK-FE-04, TASK-BE-02 | TASK-FE-04 may recommend Maestro changes; TASK-BE-02 implements them. Sequence TASK-FE-04 first. |
| `app/(tabs)/_layout.tsx` | TASK-FE-01 | Single task — no conflict. |
| `app/(tabs)/expenses.tsx` | TASK-FE-01 | Single task — no conflict. |
| `app/(tabs)/budgets.tsx` | TASK-FE-01, TASK-BE-01 | TASK-FE-01 fixes the screen component; TASK-BE-01 audits its hooks. BE-01 is read-only audit — no edit conflict. |
| `app/(tabs)/insights.tsx` | TASK-FE-01, TASK-BE-01 | Same as above — BE-01 is read-only. |
| `app/modals/add-expense.tsx` | TASK-FE-04 | Single task — no conflict. |
| `app/lock.tsx` | TASK-FE-03 | Single task — no conflict. |

---

## Summary table

| Discipline | P0 | P1 | P2 | P3 | Total |
|-----------|----|----|----|----|-------|
| FE | 1 | 2 | 1 | 1 | 5 |
| BE | 0 | 1 | 1 | 0 | 2 |
| DB | 0 | 0 | 0 | 0 | 0 |
| DEVOPS | 0 | 0 | 0 | 1 | 1 |
| **Total** | **1** | **3** | **2** | **2** | **8** |

---

## Recommended execution order

1. **Now:** Assign TASK-FE-01 to `rn-frontend-engineer` — fix tabs. This is the single gate for the entire PRD.
2. **After TASK-FE-01 merges:** Launch Wave 1 tasks in parallel across FE, BE, DEVOPS agents. Coordinate `app/_layout.tsx` edits (TASK-FE-03, TASK-FE-05, TASK-DEVOPS-01) — assign all three to the same FE agent.
3. **After TASK-FE-04 completes:** Assign TASK-BE-02 to update the Maestro add-expense flow.
4. **After all Wave 1 fixes:** Re-run full E2E suite to verify BUG-01, BUG-02, BUG-04 are resolved and to exercise Budgets/Insights for the first time.

---

## Flagged risks

- **BUG-01 root cause unknown:** The tabs layout looks correct in `_layout.tsx`. The most likely cause is each screen file accidentally importing/re-exporting the Dashboard component — but this needs confirmation by reading `expenses.tsx`, `budgets.tsx`, `insights.tsx`. Do not spend time refactoring the navigator before confirming the actual root cause.
- **BUG-02 (security):** Classified P1 not P0 because there is no evidence of data exfiltration risk beyond a brief visual flash on the user's own device. However, for a finance app targeting public release, treat this as P0 if any external security review is planned.
- **BUG-03 reclassification:** If TASK-FE-04 investigation finds the payment method field is genuinely absent at runtime (not a scroll issue), escalate immediately to P1 and file a new BUG task.
- **PRD coverage gap (BE-01):** ~40% of PRD acceptance criteria remain unverified. The business logic may be correct but untested. After TASK-FE-01 is fixed, a full E2E re-run is mandatory before the next beta release.
