# Backend Tasks — beta-test-2026-11-6-14-0

**Target agent:** `backend-api-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-06-1358.md`

---

## TASK-BE-01: Investigate and add coverage for untestable PRD features (Budgets, Insights, Push Notifications)

**Bug ref:** BUG-01 (downstream gap — features untestable until tab nav fixed)
**Priority:** P1
**Type:** INVESTIGATION
**Files touched:** `app/(tabs)/budgets.tsx`, `app/(tabs)/insights.tsx`, `lib/notifications.ts` (or equivalent), `stores/useSyncStore.ts`

### What's broken
Bug #1 (tab navigation) blocked all E2E coverage of Budgets, Insights, and Push Notifications during this test session. These features have PRD acceptance criteria that remain unverified:
- **Feature 2 (Budgets):** Progress bar at 80% (yellow) and 100% (red) visual warnings
- **Feature 6 (Insights):** Pie/donut chart and bar chart render, animation on load, tap-to-filter
- **Feature 7 (Push Notifications):** Budget threshold alerts
- **Feature 4 (Recurring):** Define recurring rule, mark as paid, dashboard surface of unpaid items
- **Feature 10 (PIN):** 5 failed attempts cooldown (30s lockout); biometric auth fallback
- **Feature 8/9 (Sync):** Sync status indicator in Settings; offline queue behavior

This task is to audit the business logic hooks and query functions behind each of these features and confirm they are implemented correctly — independent of whether the screens can currently be reached by E2E.

### Reproduction steps
1. Fix TASK-FE-01 (tab navigation).
2. Run the full E2E suite again.
3. Manually test each PRD feature listed above.

### Acceptance criteria
- [ ] Budgets screen: `getBudgetProgress` returns correct spend-vs-budget ratio; threshold logic (80% yellow, 100% red) is implemented in the hook or screen.
- [ ] Insights screen: query hooks return category breakdown data; no empty state due to userId mismatch (confirmed fixed in Batch 4).
- [ ] Push notification trigger: budget threshold alert fires when a category crosses 80% spend (or a test/stub call confirms the notification path is reachable).
- [ ] Recurring rules: `getRulesDueWithin` returns due items correctly; `markAsPaid` advances `nextDueDate` with local-date logic (not UTC ISO string — per BUG-31/32 fix already applied).
- [ ] PIN lockout: 5 failed attempts sets `LOCKOUT_UNTIL_KEY`; countdown timer displays; resets correctly after 30s.
- [ ] Sync: `useSyncStore` exposes a sync status value; Settings screen reads it.

### Technical notes
The userId mismatch (BUG-05, BUG-16, BUG-25) and UTC date bugs (BUG-31, BUG-32) were fixed in commits 379bcf2 and 90189a2. Verify those fixes hold by checking the current state of `lib/db/stubs.ts` and `db/queries/recurringRules.ts`.

For push notifications, check `lib/notifications.ts` for the budget threshold trigger — confirm it calls `Notifications.scheduleNotificationAsync` or equivalent with the correct condition.

### Dependencies
Depends on TASK-FE-01 being fixed before E2E verification is possible. Business logic audit can run in parallel. Wave 1.

---

## TASK-BE-02: Add Maestro 03-add-expense flow — scroll and assert payment method field

**Bug ref:** BUG-03
**Priority:** P2
**Type:** BUG
**Files touched:** `e2e/03-add-expense.yaml`

### What's broken
The existing `03-add-expense.yaml` flow does not scroll down in the modal and does not assert that the Payment Method field is visible or selectable. The bug report flagged payment method as missing, but code inspection shows the field exists in `add-expense.tsx` — the Maestro flow simply never scrolled to it. PRD Feature 1 requires payment method as a required field; the E2E flow needs to exercise it.

### Reproduction steps
1. Run `maestro test e2e/03-add-expense.yaml`.
2. Observe: flow saves an expense with no assertion that payment method was set.
3. The saved expense defaults to "Cash" without user interaction being tested.

### Acceptance criteria
- [ ] Flow scrolls down in the modal to reveal the Payment Method segment.
- [ ] Flow taps one of the payment method options (e.g. "GCash") to change from the default.
- [ ] Flow asserts the selected payment method option is active/checked.
- [ ] Flow saves the expense and verifies it appears on the dashboard.
- [ ] The saved expense record (if queryable via the app) reflects the chosen payment method.

### Technical notes
The Payment Method segment control in the modal is a row of `TouchableOpacity` buttons with text labels: "Cash", "GCash", "Card", "Others". In Maestro, tap by text label after scrolling.

Scroll in Maestro using `scroll` command or `swipe` on the modal's ScrollView. The modal's scroll container has no testID set — may need to add one or use a coordinate-based swipe.

Current flow structure ends with `tapOn: "Save"` — insert scroll + payment method selection before that step.

### Dependencies
Coordinate with TASK-FE-04 (payment method investigation). If TASK-FE-04 confirms the field is present at runtime, this task can proceed immediately. Wave 1.

⚠️ file conflict — `e2e/03-add-expense.yaml` is also touched by TASK-FE-04 (investigation may recommend Maestro changes). Assign to same agent or sequence TASK-FE-04 first.
