# GastosGo — Frontend Tasks
**Generated from:** docs/bugs/bugs.md  
**Date:** 2026-11-05  
**Assignee agent:** rn-frontend-engineer

---

## TASK-FE-01 — Fix GluestackUIProvider `mode` prop to `colorMode`
**Bug ref:** BUG-03  
**Severity:** High  
**File:** `app/_layout.tsx:30`  
**What to do:** Change the prop name on `<GluestackUIProvider>` from `mode` to `colorMode`. The correct Gluestack UI v2 API is `colorMode`, so the dark mode toggle in Settings currently has no visual effect.  
**Acceptance criteria:**
- `<GluestackUIProvider colorMode={effectiveMode}>` compiles without TS errors.
- Toggling dark mode in Settings visually switches the app theme immediately.
- Light mode renders correctly when the toggle is off.

---

## TASK-FE-02 — Add PIN routing guard on cold start
**Bug ref:** BUG-07  
**Severity:** High  
**File:** `app/_layout.tsx`  
**What to do:** Add a `useEffect` in `_layout.tsx` that reads `SecureStore.getItemAsync('gastosgo-pin-hash')` on mount; if a hash exists and the app is not already on `/lock`, call `router.replace('/lock')` before the tab navigator becomes interactive.  
**Acceptance criteria:**
- App with a PIN set navigates to `/lock` on every cold start before tabs are visible.
- App without a PIN set renders tabs normally with no redirect.
- After the user unlocks, tabs render as normal.

---

## TASK-FE-03 — Implement missing onboarding steps (PIN, biometrics, notifications)
**Bug ref:** BUG-06  
**Severity:** High  
**File:** `app/onboarding/`  
**What to do:** Insert three new onboarding screens between the Budget step and the final `router.replace('/(tabs)')` call: (1) PIN setup, (2) biometrics opt-in, (3) push-notification opt-in. Each step must have a "Skip" path so the flow is non-blocking.  
**Acceptance criteria:**
- Onboarding sequence is: Welcome → Budget → PIN Setup → Biometrics (optional) → Notifications (optional) → Dashboard.
- Skipping any optional step proceeds to the next step without error.
- Completing PIN setup stores the hash in SecureStore (consistent with the lock screen expectation in TASK-FE-02).
- Completing the full flow lands the user on `/(tabs)`.

---

## TASK-FE-04 — Fix PIN toggle `onValueChange` return type
**Bug ref:** BUG-08  
**Severity:** Medium  
**File:** `app/settings.tsx:149`  
**What to do:** Replace the arrow function `(v) => !v && handleDisablePIN()` with `(v) => { if (!v) handleDisablePIN(); }` so the callback returns `void` instead of `boolean | Promise<void>`.  
**Acceptance criteria:**
- No TypeScript error on `onValueChange` prop.
- Disabling the PIN toggle reliably calls `handleDisablePIN()` without the toggle animating back.

---

## TASK-FE-05 — Fix category filter chips overflow in expenses screen
**Bug ref:** BUG-10  
**Severity:** Medium  
**File:** `app/(tabs)/expenses.tsx:374`  
**What to do:** Wrap the filter-chip row in a `<ScrollView horizontal showsHorizontalScrollIndicator={false}>` (preferred) or change `flexWrap` to `'wrap'`. With 7+ default categories all chips must be reachable.  
**Acceptance criteria:**
- All category chips are tappable with 7 or more categories present.
- No chip is clipped or unreachable on a 375 pt wide screen.
- Tapping any chip correctly filters the expense list.

---

## TASK-FE-06 — Pre-fill edit form for recurring rules
**Bug ref:** BUG-11  
**Severity:** Medium  
**File:** `app/modals/add-recurring.tsx`  
**What to do:** When `params.ruleId` is present (`isEditing === true`), call `useQuery` to fetch the existing rule by that ID and seed all form state fields from it inside a `useEffect`. The form must open pre-populated in edit mode.  
**Acceptance criteria:**
- Opening the edit modal for an existing recurring rule shows all fields pre-filled with the saved values.
- Saving changes updates the existing rule rather than creating a duplicate.
- Creating a new rule (no `ruleId`) still opens with blank fields.

---

## TASK-FE-07 — Replace `hasCloudSession` stub with real `getSession` call
**Bug ref:** BUG-12  
**Severity:** Medium  
**File:** `app/onboarding/index.tsx:10`  
**What to do:** Replace `const hasCloudSession = false; // stub` with an async call to `supabase.auth.getSession()` on component mount (via `useEffect` + local state). Show the "Restore from cloud" button only when a session is found.  
**Acceptance criteria:**
- Users with an active Supabase session see the "Restore from cloud" button on the onboarding screen.
- Users without a session see the button hidden (same as current behaviour).
- No hardcoded `false` remains in the file.

---

## TASK-FE-08 — Add `legacy-peer-deps=true` to `.npmrc` to fix `npm install`
**Bug ref:** BUG-02  
**Severity:** Medium  
**File:** `.npmrc` (create if absent)  
**What to do:** Add a `.npmrc` file at the project root containing `legacy-peer-deps=true` so that `npm install` succeeds without manual flags. Document this in the project README or onboarding notes.  
**Acceptance criteria:**
- `npm install` (no extra flags) exits 0 on a clean `node_modules`.
- No new `.npmrc` entries beyond what are strictly required to resolve the conflict.

---

## TASK-FE-09 — Replace pie chart stub with `VictoryPie` once packages land
**Bug ref:** BUG-14  
**Severity:** Low  
**File:** `app/(tabs)/insights.tsx`  
**What to do:** After `victory-native` and `drizzle-orm` are installed (see TASK-DB-01), replace the horizontal segmented bar with a `VictoryPie` / `VictoryDonut` component as required by the PRD.  
**Acceptance criteria:**
- Insights screen shows a pie or donut chart for category breakdown.
- Chart renders correctly with 1–10 categories.
- The segmented-bar fallback and its code comment are removed.

**Blocked by:** TASK-DB-01 (install drizzle-orm / expo-sqlite) — `victory-native` install is gated on resolving the peer-dep conflict resolved by that task.

---

## TASK-FE-10 — Replace hardcoded budget cycle day picker with full 1–28 range
**Bug ref:** BUG-15  
**Severity:** Low  
**File:** `app/settings.tsx:88`  
**What to do:** Remove the Alert-based picker that offers only days 1, 15, and 25. Replace with a `Picker` or `ActionSheet` presenting all days 1–28.  
**Acceptance criteria:**
- User can select any day from 1 to 28 as the budget cycle start day.
- Selected value persists correctly to storage.
- Days 29–31 are intentionally absent (safe across all months).

---

## TASK-FE-11 — Move `require('react-native')` to static import
**Bug ref:** BUG-16  
**Severity:** Low  
**File:** `app/(tabs)/_layout.tsx:53`  
**What to do:** Remove `const { Text } = require('react-native')` from inside the `TabIcon` component body and replace it with a standard `import { Text } from 'react-native'` at the top of the file.  
**Acceptance criteria:**
- No `require(...)` call exists inside any component body in `_layout.tsx`.
- ESLint passes without import-order warnings on this file.
- `TabIcon` renders identically before and after the change.
