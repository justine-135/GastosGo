# TASKS-FE — Beta Test 2026-11-10 12:05
**Target agent:** `rn-frontend-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-10-1204.md`

---

## TASK-FE-01: Fix duplicate tab bar entries in TabsLayout (8 tabs instead of 4)

**Bug ref:** BUG-02
**Priority:** P1
**Type:** BUG
**Files touched:** `app/(tabs)/_layout.tsx`

### What's broken
The tab bar renders 8 entries instead of 4. Home, Expenses, Budgets, and Insights each appear twice — once with their display names and once with raw file-system names ("Index.s...", "Budget...", "expen...", "Insight..."). The root cause is that `_layout.tsx` explicitly lists `Tabs.Screen` entries for routes that Expo Router already auto-discovers from the file system, causing double registration. This also breaks tap targets: tapping "Expenses" stays on Dashboard because the second (auto-discovered) route wins.

### Reproduction steps
1. Complete onboarding so the tab layout renders.
2. Observe the tab bar — 8 items visible.
3. Run `maestro test e2e/04-navigation.yaml` and observe step-011 screenshot showing duplicates.
4. Tap "Expenses" — app remains on Dashboard.

### Acceptance criteria
- [ ] Tab bar shows exactly 4 entries: Home, Expenses, Budgets, Insights.
- [ ] Each tab tap navigates to the correct screen and does not stay on Dashboard.
- [ ] No raw file-system names visible in the tab bar.
- [ ] `e2e/04-navigation.yaml` passes all tab assertions.

### Technical notes
Expo Router auto-discovers routes from `app/(tabs)/` file names. Explicit `<Tabs.Screen name="...">` declarations in `_layout.tsx` are only needed to customize `href`, `tabBarIcon`, `tabBarLabel`, or `title` — not to register the route. If the layout lists a `<Tabs.Screen name="index" />` AND the file `app/(tabs)/index.tsx` exists, both get registered. Audit `app/(tabs)/_layout.tsx` for any `<Tabs.Screen>` whose `name` prop matches an existing file; either remove the declaration (if no customization is needed) or confirm only one declaration exists per route with the needed options. This file appeared in Batch 7 as a hotspot (`_layout.tsx` dangling fallback timer, TASK-FE-04) — check for other live issues while touching it.

### Dependencies
None — parallel-safe. TASK-FE-02 and TASK-FE-03 are blocked on this fix.

---

## TASK-FE-02: Add Insights E2E flow — charts, month filter, slice tap (PRD Feature 6)

**Bug ref:** BUG-04 (coverage gap)
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** `e2e/05-insights.yaml` (new file), `app/(tabs)/insights.tsx`

### What's broken
There is no E2E flow for the Insights screen. The PRD requires pie chart animation on load, bar chart display, month filter interaction, and tapping a slice to show category details — none of these are exercised by any Maestro flow. This is a coverage gap, not a confirmed runtime bug, but it blocks PRD acceptance sign-off for Feature 6.

### Reproduction steps
1. Run all 4 existing flows — none open the Insights tab or assert any chart content.
2. Navigate to Insights tab manually and observe charts render (verify baseline behavior).

### Acceptance criteria
- [ ] `e2e/05-insights.yaml` exists and runs without errors.
- [ ] Flow taps the Insights tab and asserts the pie chart container is visible.
- [ ] Flow taps the month filter and asserts a month label changes.
- [ ] Flow taps a pie slice and asserts a category detail element is visible.
- [ ] Flow asserts bar chart container is visible.
- [ ] All assertions pass on a clean run after onboarding.

### Technical notes
Inspect `app/(tabs)/insights.tsx` before writing the flow — from Batch 7 (TASK-FE-02) the `slice.data.id` was cast to string as `String(slice.data.id)` with a potential null passthrough. Verify that tapping a null-id slice does not crash before asserting the detail view. The existing pie chart uses `react-native-svg` via `victory-native`; Maestro can tap by `testID` or visible label. Assign stable `testID` props to: pie chart wrapper, bar chart wrapper, month filter button, and slice detail container if they are missing.

### Dependencies
Depends on TASK-FE-01 (tab navigation must work before the Insights tab is reachable in flow). ⚠️ insights.tsx was also touched in TASK-FE-01 of Batch 7 — assign to same agent or sequence after that prior fix is confirmed merged.

---

## TASK-FE-03: Add Recurring Expenses section assertion to E2E navigation flow

**Bug ref:** BUG-03 (blocked by BUG-02)
**Priority:** P2
**Type:** BUG
**Files touched:** `e2e/04-navigation.yaml`

### What's broken
The `Recurring` section header on the Expenses screen is never asserted in any E2E flow. This was surfaced indirectly: flow 04 never reaches the Expenses screen because Bug #2 (tab duplication) blocks navigation. Once tab navigation is fixed, the section's existence must be verified explicitly. Currently unconfirmed whether the Recurring section actually renders.

### Reproduction steps
1. Fix TASK-FE-01 (tab duplication).
2. Run `maestro test e2e/04-navigation.yaml` — observe whether the Expenses screen is reached and whether a "Recurring" section header is visible.

### Acceptance criteria
- [ ] `e2e/04-navigation.yaml` taps the Expenses tab and asserts the Expenses screen is visible (not Dashboard).
- [ ] Flow asserts the `Recurring` section header (or container) is visible on the Expenses screen.
- [ ] Flow passes end-to-end without timeout.

### Technical notes
Add an `assertVisible: "Recurring"` (or testID equivalent) step to `04-navigation.yaml` after the Expenses tab tap. If the Recurring section is below fold, add a `scrollDown` step before the assertion — this is the same scroll-gap pattern that caused false negatives in Batches 5 and 6 (03-add-expense.yaml never scrolled to the payment method field).

### Dependencies
Blocked by TASK-FE-01. ⚠️ `e2e/04-navigation.yaml` is also touched by TASK-DEVOPS-01 — assign to same agent or sequence after TASK-DEVOPS-01.
