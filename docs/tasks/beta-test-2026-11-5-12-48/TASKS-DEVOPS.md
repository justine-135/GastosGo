# DevOps / Infrastructure Tasks — Beta Test 2026-11-05
**Target agent:** `devops-pipeline-engineer`
**Source report:** `docs/bugs/beta-test-2026-11-05-1248.md`

---

## TASK-DEVOPS-01: Install victory-native to fix Insights screen Metro crash

**Bug ref:** coverage gap (from report notes section)
**Priority:** P0
**Type:** BUG
**Files touched:** `package.json`, `package-lock.json` (or `yarn.lock`), `app.json` (if native config is needed)

### What's broken
`victory-native` is imported in the Insights screen but is not listed in `package.json`. Metro bundler fails at startup with a module-not-found error for `victory-native`. The Insights screen is entirely unusable — it crashes before rendering anything.

### Reproduction steps
1. Run `npx expo start` or `npx expo run:android`.
2. Navigate to the Insights tab.
3. Observe: Metro throws `Cannot find module 'victory-native'`.

### Acceptance criteria
- [ ] `victory-native` is added to `dependencies` in `package.json`.
- [ ] `npm install` (or `yarn`) completes without errors.
- [ ] Metro bundler resolves `victory-native` successfully.
- [ ] Insights screen loads without a module-not-found crash.

### Technical notes
Check the version of `victory-native` required by the Insights screen's import style (v35+ has a different API than v36+ which requires `react-native-svg` and `react-native-reanimated` as peer deps). Verify those peer deps are already installed before adding. Command: `npm install victory-native`.

### Dependencies
none — this is a prerequisite for any visual testing of the Insights screen; complete before TASK-FE-10, TASK-FE-11, TASK-BE-04 are tested.

---

## TASK-DEVOPS-02: Add Android back-navigation guard to onboarding

**Bug ref:** coverage gap (from report notes section)
**Priority:** P1
**Type:** BUG
**Files touched:** `app/onboarding/_layout.tsx` (or each onboarding screen)

### What's broken
On Android, the hardware back button is not intercepted during onboarding. Users who accidentally tap back mid-flow exit the entire onboarding process and land on a partially-initialized state with no way to resume.

### Reproduction steps
1. Start onboarding on an Android device.
2. Progress to step 3.
3. Press the hardware back button.
4. Observe: app exits onboarding entirely; state is partially written.

### Acceptance criteria
- [ ] Hardware back button press during onboarding shows a confirmation dialog ("Exit setup? Your progress will be lost.") or is silently blocked.
- [ ] Accidental back press does not exit mid-flow without user confirmation.
- [ ] iOS swipe-back gesture is unaffected (or similarly guarded).

### Technical notes
Use `useBackHandler` from `@react-native-community/hooks` or the React Native built-in `BackHandler.addEventListener('hardwareBackPress', handler)` in a `useEffect`. For Expo Router, the `gestureEnabled: false` option on the Stack screen config also disables swipe-back on iOS.

### Dependencies
TASK-FE-02 (onboarding sub-routes must resolve first before testing back-nav behavior on Android)

---

## TASK-DEVOPS-03: Fix Settings "Backup Now" synchronous throw with no session and no UI catch

**Bug ref:** coverage gap (from report notes section)
**Priority:** P1
**Type:** BUG
**Files touched:** settings screen file (locate via grep for "Backup Now"), the backup function it calls

### What's broken
Tapping "Backup Now" in Settings calls a function that throws synchronously when no Supabase session exists. The throw is uncaught in the UI, causing an unhandled promise rejection or a React error boundary trigger. The user sees no actionable error.

### Reproduction steps
1. Open Settings while logged out or with no active Supabase session.
2. Tap "Backup Now".
3. Observe: app throws an uncaught error or shows a generic crash screen.

### Acceptance criteria
- [ ] "Backup Now" handler wraps the backup call in try/catch.
- [ ] If no session exists, show a user-readable message: "Sign in to back up your data."
- [ ] If the backup call throws for another reason, show a generic error message with a retry option.
- [ ] No unhandled promise rejections in the console.

### Technical notes
The sync throw likely comes from accessing `session.user.id` before checking if `session` is null. Add a session existence guard before the backup call. The UI catch should use a toast or inline error message — not `console.warn`.

### Dependencies
none — parallel-safe
