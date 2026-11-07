# Frontend Tasks — beta-test-2026-11-6-14-0

**Target agent:** `rn-frontend-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-06-1358.md`

---

## TASK-FE-01: Fix tab navigation — all tabs stuck rendering Dashboard

**Bug ref:** BUG-01
**Priority:** P0
**Type:** BUG
**Files touched:** `app/(tabs)/_layout.tsx`, `app/(tabs)/expenses.tsx`, `app/(tabs)/budgets.tsx`, `app/(tabs)/insights.tsx`, `app/(tabs)/index.tsx`

### What's broken
Tapping the Expenses, Budgets, and Insights tabs never navigates away from the Dashboard screen. All tab screenshots show identical "Recent Transactions" content. The `_layout.tsx` tab definitions look structurally correct (`Tabs.Screen name="expenses"` etc.), so the root cause is likely one of: (a) each screen returns the Dashboard component, (b) a stale route cache forces every tab to render `index`, or (c) a navigator wrapping issue in a parent layout. This blocks ~40% of PRD acceptance criteria.

### Reproduction steps
1. Complete onboarding (or cold-start with no onboarding required).
2. From Dashboard, tap the "Expenses" tab.
3. Observe screen content — still shows "Recent Transactions".
4. Repeat for "Budgets" and "Insights".

### Acceptance criteria
- [ ] Tapping "Expenses" tab renders the Expenses screen (unique heading or element, NOT "Recent Transactions").
- [ ] Tapping "Budgets" tab renders the Budgets screen.
- [ ] Tapping "Insights" tab renders the Insights screen.
- [ ] Tapping "Home" tab returns to the Dashboard ("Recent Transactions" visible).
- [ ] No console error thrown during tab switch.

### Technical notes
`app/(tabs)/_layout.tsx` declares `<Tabs.Screen name="index" />`, `expenses`, `budgets`, `insights` — the structure looks correct. Suspects in order of likelihood:
1. `app/(tabs)/expenses.tsx`, `budgets.tsx`, or `insights.tsx` are importing and rendering `index.tsx`'s default export directly (copy-paste error or accidental re-export).
2. The `(tabs)` group navigator is somehow nested inside another Stack screen that intercepts all routes.
3. Expo Router file-based routing cache stale — unlikely to persist across installs but worth clearing (`npx expo start -c`).

Check each screen file: open `expenses.tsx`, `budgets.tsx`, `insights.tsx` and confirm they export unique default components. If they accidentally `export { default } from './index'`, that is the entire bug.

### Dependencies
None — parallel-safe. This is a Wave 0 blocker: TASK-FE-02 (Maestro flow fix) depends on this being fixed first.

---

## TASK-FE-02: Fix Maestro 04-navigation flow — assertions match tab labels, not screen content

**Bug ref:** BUG-01 (Maestro flow structural flaw noted in report)
**Priority:** P1
**Type:** BUG
**Files touched:** `e2e/04-navigation.yaml`

### What's broken
The `04-navigation.yaml` flow uses `extendedWaitUntil: visible: "Expenses"` etc. to assert navigation succeeded, but "Expenses", "Budgets", and "Insights" are always visible in the tab bar regardless of which screen is active. This caused the flow to pass falsely even when all tabs rendered Dashboard content. The flow needs content-level assertions — either assert a unique element on each screen, or assert that the Dashboard element disappears.

### Reproduction steps
1. Run `maestro test e2e/04-navigation.yaml` while BUG-01 is present.
2. Observe: all steps pass despite the wrong screen being shown.

### Acceptance criteria
- [ ] After tapping "Expenses" tab, flow asserts a unique Expenses-screen element (e.g. a heading or list label that only appears on that screen) OR asserts `assertNotVisible: "Recent Transactions"`.
- [ ] Same pattern applied to Budgets and Insights tab assertions.
- [ ] When BUG-01 is present, the flow must FAIL.
- [ ] When BUG-01 is fixed, the flow must PASS.

### Technical notes
Current assertion: `extendedWaitUntil: visible: "Expenses"` — this matches the tab bar label.
Minimal fix: add `assertNotVisible: "Recent Transactions"` after each tab tap, before the screenshot. This is the safest option since it doesn't require knowing the exact unique heading on each screen.

If each screen has a unique page title or section header, asserting that is more robust. Coordinate with the fix in TASK-FE-01 to confirm the exact testId or visible text available on each screen.

### Dependencies
Depends on TASK-FE-01 (must verify the fix works with the corrected assertions). Wave 1 (run after TASK-FE-01).

---

## TASK-FE-03: Add blur/overlay to hide app content until PIN auth completes

**Bug ref:** BUG-02
**Priority:** P1
**Type:** SECURITY
**Files touched:** `app/_layout.tsx`, `app/lock.tsx`

### What's broken
On cold start (or resume from background after ≥30s), the app renders its tab content briefly before redirecting to `/lock`. The smoke test confirmed "Recent Transactions" is visible before the PIN screen appears — a window where financial data is exposed without authentication. The race is in `app/_layout.tsx`: the `useEffect` that redirects to `/lock` runs after the initial render, so there is at least one frame where the tabs content is visible.

### Reproduction steps
1. Set a PIN during onboarding.
2. Send the app to the background for ≥30s.
3. Re-open the app.
4. Observe: "Recent Transactions" content is momentarily visible before the PIN pad appears.

### Acceptance criteria
- [ ] On cold start with a PIN set, no financial data (transaction list, amounts, balances) is visible before PIN auth completes.
- [ ] A neutral loading state (blank screen, logo, or blur overlay) is shown until the PIN check resolves.
- [ ] After successful PIN entry, the app transitions to the tab content normally.
- [ ] On resume from background, same neutral state applies before PIN entry.

### Technical notes
Root cause in `app/_layout.tsx` lines 33–44: `SecureStore.getItemAsync` is async — there is a render before the promise resolves. Options:
1. **Preferred (smallest diff):** Add a `isAuthChecking` boolean state initialized to `true`. Render a full-screen opaque `View` (or just `null`) in place of the `Stack` until `isAuthChecking` is `false`. Set it to `false` inside the `SecureStore` callback regardless of whether a redirect happened.
2. **Alternative:** Render `<Stack>` but add a full-screen overlay `View` with `zIndex: 999` and `backgroundColor` covering all content — hide it once auth check completes.

The lock screen itself (`app/lock.tsx`) does not need to change — the fix is entirely in `_layout.tsx`.

### Dependencies
None — parallel-safe.

---

## TASK-FE-04: Investigate payment method field visibility in Add Expense modal

**Bug ref:** BUG-03
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** `app/modals/add-expense.tsx`, `e2e/03-add-expense.yaml`

### What's broken
The bug report states the payment method field is missing from the Add Expense modal. However, reading `add-expense.tsx` shows the Payment Method segment control IS present in the JSX (lines 241–256), after the Notes field. The likely cause is that the field is below the fold in a ScrollView and the Maestro flow screenshot was taken before scrolling. The 03-add-expense flow also does not scroll or assert the payment method field. This needs investigation to confirm: is the field truly missing at runtime, or is it present but not reachable/visible?

### Reproduction steps
1. From Dashboard tap "+" FAB.
2. In the Add Expense modal, scroll down past the Notes field.
3. Confirm whether "Payment Method" label and Cash/GCash/Card/Others buttons appear.

### Acceptance criteria
- [ ] Manual inspection confirms the payment method field is or is not present at runtime.
- [ ] If present but below fold: Maestro 03-add-expense flow is updated to scroll down and assert the payment method segment is visible (see TASK-DEVOPS-01).
- [ ] If genuinely missing at runtime (render conditional or JSX removed): a follow-up BUG task is filed and fixed.
- [ ] PRD Feature 1 AC for payment method as required field is confirmed satisfied or a gap is logged.

### Technical notes
`add-expense.tsx` line 241: `<Text style={styles.fieldLabel}>Payment Method</Text>` followed by a `segmentRow` View with four `TouchableOpacity` buttons. The field is NOT behind a conditional — it always renders. Most likely scenario: the Maestro screenshot did not scroll, and the visual QA assumed the field was absent.

Field render order in the modal: Amount → Category → (New Category inline form) → Merchant → Notes → **Payment Method** → Date. Payment Method is 6 items deep in the scroll — easily missed without scrolling.

If investigation confirms the field is present, the only real fix is updating the Maestro flow to scroll and assert it, plus ensuring the field is reachable with a reasonable scroll distance.

### Dependencies
None — parallel-safe. If this spawns a follow-up fix, that fix depends on this investigation.

---

## TASK-FE-05: Suppress Expo debugger warning banner in non-dev builds

**Bug ref:** BUG-04
**Priority:** P3
**Type:** UX/UI
**Files touched:** `app/_layout.tsx` (possibly), Expo config (`app.json` or `app.config.ts`)

### What's broken
A yellow "Open debugger to view warnings" banner appears at the bottom of every screen across all Maestro flows. This is Expo's LogBox warning banner that surfaces in development builds. It should not appear during normal app usage or E2E test runs. While harmless in dev, it pollutes screenshots, can obscure UI elements in Maestro assertions, and would be visible to beta testers running a development build.

### Reproduction steps
Visible in every Maestro screenshot across all 4 flows.

### Acceptance criteria
- [ ] The yellow debugger banner is not visible in any screen during E2E test runs.
- [ ] No warnings are silenced that would hide real development issues (the fix should be scoped correctly).

### Technical notes
Two approaches:
1. **Recommended for E2E:** Add `LogBox.ignoreAllLogs(true)` guarded by `__DEV__ && process.env.E2E === 'true'` in `app/_layout.tsx`. Set `E2E=true` in the Maestro launch environment or in the Metro start script used for testing.
2. **Alternative:** Add `LogBox.ignoreAllLogs()` only in production builds (`if (!__DEV__)`). This hides the banner from beta testers on dev builds too, which may mask real warnings — use with caution.
3. If the banner is caused by a specific warning that can be fixed, fix the underlying warning instead.

Check what warnings are triggering the banner first — they may point to a real issue (e.g. missing keys, deprecated API calls).

### Dependencies
None — parallel-safe.
