# Frontend Tasks — Beta Test 2026-11-05
**Target agent:** `rn-frontend-engineer`
**Source report:** `docs/bugs/beta-test-2026-11-05-1248.md`

---

## TASK-FE-01: Fix cold-start blank screen / redirect loop in root layout

**Bug ref:** BUG-01
**Priority:** P0
**Type:** BUG
**Files touched:** `app/_layout.tsx`

### What's broken
`router.replace('/lock')` is called at lines 30–39 before the Expo Router navigator is mounted. On cold start this either renders a blank white screen or triggers a redirect loop because the navigator is not ready to accept imperative navigation calls.

### Reproduction steps
1. Install a fresh build (or clear app data).
2. Launch the app cold.
3. Observe blank screen or console error `Attempted to navigate before mounting the Root Layout component`.

### Acceptance criteria
- [ ] Root layout wraps the redirect call in a `useRootNavigationState` guard so navigation only fires when `navigationState.key` is defined.
- [ ] Cold-start no longer shows a blank screen on iOS or Android.
- [ ] No redirect loop in Expo Go or standalone build.

### Technical notes
Expo Router v4 exposes `useRootNavigationState` from `expo-router`. Pattern:
```ts
const navState = useRootNavigationState();
useEffect(() => {
  if (!navState?.key) return; // navigator not ready
  router.replace('/lock');
}, [navState?.key]);
```

### Dependencies
none — parallel-safe

---

## TASK-FE-02: Fix Android unresolvable onboarding sub-routes

**Bug ref:** BUG-04
**Priority:** P0
**Type:** INVESTIGATION
**Files touched:** `app/_layout.tsx`, `app/onboarding/_layout.tsx` (if exists)

### What's broken
`app/_layout.tsx` registers only the top-level `onboarding` group, with no sub-route declarations. On Android, Expo Router v4 may fail to resolve deep paths like `onboarding/budget` or `onboarding/income`, causing a blank screen or native crash.

### Reproduction steps
1. Run the app on an Android device or emulator.
2. Progress through the first onboarding screen.
3. Observe whether the app navigates correctly to `onboarding/budget`.

### Acceptance criteria
- [ ] All `onboarding/*` routes resolve on Android without crashing.
- [ ] If sub-route declarations are required by Expo Router v4, they are added to `_layout.tsx` or a dedicated `app/onboarding/_layout.tsx`.
- [ ] Investigation documents whether this is a config gap or a router v4 behavioral change.

### Technical notes
Expo Router v4 introduced stricter group resolution. Check the router changelog for group/sub-route declaration requirements. If a nested layout is needed, create `app/onboarding/_layout.tsx` with a `<Stack>` or `<Slot>`.

### Dependencies
TASK-FE-01 (root layout must be stable before testing sub-route resolution)

---

## TASK-FE-03: Fix PIN length check on lock screen (4-digit vs 6-digit)

**Bug ref:** BUG-02
**Priority:** P0
**Type:** BUG
**Files touched:** `app/lock.tsx`

### What's broken
`app/lock.tsx` line 140 reads `if (current.length < 4) return`, so it submits after 4 digits. Onboarding stores a 6-digit PIN hash. Every PIN entry attempt with fewer than 6 digits is submitted prematurely, never matching the stored hash — permanently locking users out.

### Reproduction steps
1. Complete onboarding (sets a 6-digit PIN).
2. Lock the app.
3. Enter any 4-digit sequence — the lock screen attempts validation immediately and fails.
4. After several attempts, the user is permanently locked out with no recovery path.

### Acceptance criteria
- [ ] Guard changed to `if (current.length < 6) return`.
- [ ] Entering exactly 6 digits triggers validation.
- [ ] Partial 4-digit input does not trigger validation.

### Technical notes
`app/lock.tsx` line 140. Also verify that the PIN input UI renders 6 dot indicators, not 4, to match the new length. See also TASK-FE-07 (Change PIN) which touches the same file.

### Dependencies
⚠️ file conflict — `app/lock.tsx` is also touched by TASK-FE-07. Assign both to same agent or sequence TASK-FE-03 before TASK-FE-07.

---

## TASK-FE-04: Fix onboarding budget screen silent DB error swallowing

**Bug ref:** BUG-06
**Priority:** P1
**Type:** BUG
**Files touched:** `app/onboarding/budget.tsx`

### What's broken
`app/onboarding/budget.tsx` lines 25–49 contain DB write calls with no error handling. When the DB write fails (e.g., due to userId mismatch or schema issue), the user sees no feedback and silently proceeds to the next onboarding step with no budget saved.

### Reproduction steps
1. Start onboarding on a fresh install.
2. Reach the budget entry screen.
3. Enter a budget amount and submit.
4. If the DB write fails, no error is shown and the user advances anyway.

### Acceptance criteria
- [ ] DB write errors surface a visible error message to the user (e.g., toast or inline error).
- [ ] On error, the submit button re-enables so the user can retry.
- [ ] On success, the flow advances normally.

### Technical notes
Wrap the DB call in try/catch or use a `.catch()` handler that sets an error state string. Display it below the submit button.

### Dependencies
TASK-BE-01 (userId constant fix) — budget writes will fail until userId is consistent.

---

## TASK-FE-05: Fix mixed income mode hiding savings target (always saves 0)

**Bug ref:** BUG-11
**Priority:** P1
**Type:** BUG
**Files touched:** `app/onboarding/income.tsx`

### What's broken
`app/onboarding/income.tsx` line 90: when the user selects "mixed" income mode, the savings target input is hidden. The savings value is never collected, so it defaults to 0 and is persisted as 0. Users who rely on a savings target are silently broken.

### Reproduction steps
1. Start onboarding.
2. On the income screen, select "mixed" income mode.
3. Observe that the savings target field does not appear.
4. Complete onboarding — savings target is 0.

### Acceptance criteria
- [ ] "Mixed" income mode displays the savings target input field.
- [ ] The entered savings target is correctly passed to the DB write.
- [ ] "Fixed" and "variable" modes are unaffected.

### Technical notes
`app/onboarding/income.tsx` line 90 — likely a conditional render that excludes `mixed`. Add `|| mode === 'mixed'` to the condition.

### Dependencies
none — parallel-safe

---

## TASK-FE-06: Fix "Change PIN" visible when no PIN is set

**Bug ref:** BUG-21
**Priority:** P3
**Type:** UX/UI
**Files touched:** `app/lock.tsx`

### What's broken
The "Change PIN" option is shown even when no PIN has been set. Tapping it immediately shows "Incorrect PIN" with no recovery path, as there is nothing to change from.

### Reproduction steps
1. Complete onboarding without setting a PIN.
2. Navigate to the lock/settings screen.
3. Observe "Change PIN" is visible.
4. Tap it — receive "Incorrect PIN" with no way to exit.

### Acceptance criteria
- [ ] "Change PIN" is only rendered when a PIN hash exists in storage.
- [ ] When no PIN is set, the option is hidden or replaced with "Set PIN".

### Technical notes
Check SecureStore (or AsyncStorage) for the existence of the PIN hash key before rendering the option.

### Dependencies
⚠️ file conflict — `app/lock.tsx` is also touched by TASK-FE-03 and TASK-FE-07. Assign all three to the same agent. Sequence: TASK-FE-03, then TASK-FE-07, then TASK-FE-06.

---

## TASK-FE-07: Fix Change PIN flow — new PIN never saved

**Bug ref:** BUG-12
**Priority:** P1
**Type:** BUG
**Files touched:** `app/lock.tsx`

### What's broken
`app/lock.tsx` lines 119–125, 175–192: the Change PIN flow collects the new PIN but never persists it. After the flow completes, the old PIN remains active.

### Reproduction steps
1. Set a PIN during onboarding.
2. Navigate to Change PIN.
3. Enter old PIN (correct), then new PIN twice.
4. Confirm change.
5. Lock the app and attempt to unlock with the new PIN — it fails. Old PIN still works.

### Acceptance criteria
- [ ] After a successful Change PIN flow, the new PIN hash is written to storage.
- [ ] Old PIN no longer unlocks the app.
- [ ] Error state is shown if old PIN is incorrect.

### Technical notes
Lines 175–192 likely call a function that hashes the new PIN but omits the storage write. Add `await SecureStore.setItemAsync(PIN_KEY, newHash)` after successful hash generation.

### Dependencies
⚠️ file conflict — `app/lock.tsx` also touched by TASK-FE-03 and TASK-FE-06. Assign to same agent. Sequence: TASK-FE-03 first (PIN length fix is a prerequisite for consistent PIN behavior).

---

## TASK-FE-08: Fix onboarding step indicator showing "3 of 3" for 6-step flow

**Bug ref:** BUG-15
**Priority:** P2
**Type:** UX/UI
**Files touched:** `app/onboarding/` (step indicator component or each onboarding screen)

### What's broken
Step progress indicators hard-code the total as 3 steps. The onboarding flow now has 6 steps. Users see "3 of 3" on steps 1–3 and then no indicator (or a broken one) on steps 4–6.

### Reproduction steps
1. Start onboarding on a fresh install.
2. Observe the step indicator on each screen.
3. On step 4+, indicator is wrong or missing.

### Acceptance criteria
- [ ] Step indicator shows correct current step and total (e.g., "4 of 6") on all 6 onboarding screens.
- [ ] Indicator is driven by a single constant, not duplicated across each screen.

### Technical notes
Locate the step indicator component (likely in `app/onboarding/` or a shared component). Replace the hard-coded total with the actual step count. Consider a `ONBOARDING_STEPS = 6` constant.

### Dependencies
none — parallel-safe

---

## TASK-FE-09: Fix biometrics enabled flag never read by lock screen

**Bug ref:** BUG-17
**Priority:** P2
**Type:** BUG
**Files touched:** `app/lock.tsx`

### What's broken
Onboarding writes a "biometrics enabled" flag to storage, but the lock screen never reads it. The biometric prompt is never shown, even for users who opted in during onboarding.

### Reproduction steps
1. Enable biometrics during onboarding.
2. Lock the app.
3. Observe: biometric prompt does not appear. Only PIN entry is shown.

### Acceptance criteria
- [ ] On lock screen mount, read the biometrics flag from storage.
- [ ] If flag is true, trigger the biometric prompt via `expo-local-authentication`.
- [ ] Successful biometric auth unlocks the app without requiring PIN.

### Technical notes
`app/lock.tsx` — add a `useEffect` on mount that reads the flag and calls `LocalAuthentication.authenticateAsync` if set.

### Dependencies
⚠️ file conflict — `app/lock.tsx` also touched by TASK-FE-03, TASK-FE-06, TASK-FE-07. Assign to same agent.

---

## TASK-FE-10: Fix pie chart onSelect/selectedId props not wired in Insights

**Bug ref:** BUG-10
**Priority:** P1
**Type:** BUG
**Files touched:** `app/(tabs)/insights.tsx`

### What's broken
`insights.tsx` lines 150–185: the pie chart component declares `onSelect` and `selectedId` props but neither is connected to state. Tapping a pie slice has no effect — the selected slice is never highlighted and no detail panel opens.

### Reproduction steps
1. Navigate to Insights tab.
2. Tap any pie slice.
3. Observe: no visual selection, no detail view.

### Acceptance criteria
- [ ] `useState` tracks the selected slice ID.
- [ ] `selectedId` is passed as the current state value.
- [ ] `onSelect` updates the state.
- [ ] Selected slice is visually highlighted.

### Technical notes
`insights.tsx` lines 150–185. Add `const [selectedId, setSelectedId] = useState<string | null>(null)` and wire `onSelect={setSelectedId}` and `selectedId={selectedId}` on the pie chart component.

### Dependencies
⚠️ file conflict — `app/(tabs)/insights.tsx` also touched by TASK-BE-04 (query optimization) and TASK-FE-11 (Y-axis label). Assign all Insights tasks to the same agent.

---

## TASK-FE-11: Fix bar chart showing ₱0.50 Y-axis on fresh install

**Bug ref:** BUG-13
**Priority:** P2
**Type:** UX/UI
**Files touched:** `app/(tabs)/insights.tsx`

### What's broken
On a fresh install with no budget data, the bar chart renders a ₱0.50 Y-axis label instead of a clean ₱0 or empty state. This is a display artifact from dividing zero or near-zero values.

### Reproduction steps
1. Install fresh (no data).
2. Navigate to Insights tab.
3. Observe bar chart Y-axis showing ₱0.50.

### Acceptance criteria
- [ ] When all budget values are 0, the Y-axis shows ₱0 or the chart renders an empty state.
- [ ] No fractional peso labels appear on the Y-axis for zero-data states.

### Technical notes
Likely a default tick calculation in the charting library dividing a near-zero domain. Add a domain minimum guard: if max value is 0, use a static domain `[0, 1]` or render an empty-state placeholder instead of the chart.

### Dependencies
⚠️ file conflict — `app/(tabs)/insights.tsx` also touched by TASK-BE-04 and TASK-FE-10. Assign to same agent.

---

## TASK-FE-12: Fix null categoryId collapsing uncategorised expenses into invisible chip

**Bug ref:** BUG-14
**Priority:** P2
**Type:** BUG
**Files touched:** `app/(tabs)/insights.tsx` or the category chip component (locate via grep)

### What's broken
Expenses with `categoryId = null` are grouped and displayed as a chip, but the chip renders as invisible (empty label, no color) because the display logic doesn't handle the null case. These expenses effectively disappear from the view.

### Reproduction steps
1. Add an expense with no category assigned.
2. Navigate to Insights or the expense list.
3. Observe: the uncategorised expense is not visible in the category grouping.

### Acceptance criteria
- [ ] Expenses with `null` categoryId are grouped under an "Uncategorised" label with a fallback color.
- [ ] The chip is visible and renders correctly.

### Technical notes
Add a null guard in the chip rendering: `label = category?.name ?? 'Uncategorised'` and `color = category?.color ?? '#9CA3AF'`.

### Dependencies
none — parallel-safe; but if the chip component is inside `insights.tsx`, assign to same agent as TASK-FE-10 and TASK-FE-11.

---

## TASK-FE-13: Fix MonthNavigator missing future-date cap

**Bug ref:** BUG-23
**Priority:** P2
**Type:** UX/UI
**Files touched:** component file for `MonthNavigator` (locate via grep for `MonthNavigator`)

### What's broken
The MonthNavigator's "next month" button has no cap. Users can scroll indefinitely into future months, all of which return empty data, creating a confusing UX with no feedback.

### Reproduction steps
1. Navigate to any screen with the MonthNavigator.
2. Tap the "next" arrow repeatedly.
3. Observe: app allows navigation years into the future with no data shown.

### Acceptance criteria
- [ ] The "next" button is disabled when the displayed month equals the current month.
- [ ] No navigation is possible to months in the future.

### Technical notes
Cap condition: `isCurrentMonth = displayedMonth >= startOfMonth(new Date())`. Disable the next-arrow when this is true.

### Dependencies
none — parallel-safe

---

## TASK-FE-14: Fix tab active state using fragile hex string comparison

**Bug ref:** BUG-18
**Priority:** P3
**Type:** BUG
**Files touched:** tab navigator component or `app/(tabs)/_layout.tsx`

### What's broken
The tab bar's active state is determined by comparing a hex color string directly (e.g., `color === '#1A1A2E'`). If the color constant ever changes, the active tab loses its visual indicator with no error — a silent regression.

### Reproduction steps
1. Navigate between tabs.
2. Inspect the active tab indicator logic in code — it compares `color` prop to a hard-coded hex string.

### Acceptance criteria
- [ ] Active state is determined by a route-based prop (e.g., `focused` from Expo Router tab options), not color comparison.
- [ ] Hard-coded hex comparison is removed.

### Technical notes
Expo Router's `<Tabs.Screen>` passes a `focused` boolean to its icon render function. Use that instead.

### Dependencies
none — parallel-safe

---

## TASK-FE-15: Fix pull-to-refresh spinner hardcoded to never animate

**Bug ref:** BUG-19
**Priority:** P3
**Type:** UX/UI
**Files touched:** one or more list screens using `<RefreshControl>` (locate via grep for `refreshing={false}`)

### What's broken
`<RefreshControl refreshing={false}` is hard-coded, so the spinner never appears during a pull-to-refresh. Users get no visual feedback that a refresh is in progress.

### Reproduction steps
1. Open any list screen with pull-to-refresh.
2. Pull down to trigger refresh.
3. Observe: spinner does not appear; it snaps back immediately.

### Acceptance criteria
- [ ] `refreshing` prop is driven by a state variable, not hard-coded `false`.
- [ ] Spinner appears while the refresh is in progress.
- [ ] Spinner disappears when the refresh resolves.

### Technical notes
Pattern: `const [refreshing, setRefreshing] = useState(false)` with `onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }}`.

### Dependencies
none — parallel-safe
