# Onboarding Screens Review

Reviewed: `_layout`, `index`, `income`, `budget`, `pin-setup`, `biometrics`, `notifications`.

---

## Cross-cutting (all 6 step screens)
**Severity:** Medium

### Issues
- [Medium] The **step indicator is copy-pasted** into all 6 screens: `{[0,1,2,3,4,5].map(i => <View ... i===N && styles.dotActive />)}` plus identical `dot`/`dotActive`/`stepRow` styles and `accessibilityLabel="Step N of 6"`. Six copies of the same widget. Extract `<StepIndicator current={n} total={6} />` into `components/`. This is the highest-value onboarding refactor — a flow change (add/remove a step) currently means editing six files.
- [Medium] Flow ordering is confusing. `index.tsx` is labeled "Step 1 of 6" but its "Get Started" navigates to `/onboarding/income` ("Step 2"). Yet `income → budget → pin-setup → biometrics → notifications` is only 5 more, and `index` renders a *welcome + restore* screen, not a numbered data step. The 6-dot indicator counting the welcome screen as step 1 is defensible but the mismatch between "welcome" and "step 1" is worth a design note.
- [Medium] **Style convention not followed.** All 7 onboarding screens have `StyleSheet.create(...)` inline. Each needs a co-located `<name>.styles.ts` (e.g. `income.styles.ts` next to `income.tsx`). The shared `dot`/`dotActive`/`stepRow` styles should live in `StepIndicator.styles.ts` once that component is extracted.
- [Low] Every screen re-declares identical `safe`/`container`/`primaryBtn`/`dot` styles. After extracting `StepIndicator`, consider a shared onboarding style module or the token layer.
- [Low] Hardcoded hex everywhere (token note).

### Strengths
- Consistent, polished visual language across all steps. Every interactive element has an `accessibilityRole` + `accessibilityLabel`; disabled states use `accessibilityState`. `minHeight: 56` buttons meet touch targets. Bilingual welcome copy is a nice product touch.

---

## _layout (`app/onboarding/_layout.tsx`)
**Severity:** Low

### Issues
- [Low] The large comment block (lines 5–13) is historical investigation notes (TASK-FE-02). Valuable context, but it describes a *past debugging session*, not current behavior — consider trimming to a one-line "why this file exists" and moving the narrative to a PR/commit. Per review guidelines, comments should explain why the code is the way it is, not recount the investigation.

### Strengths
- The Android hardware-back guard with a confirm `Alert` and `return true` to consume the event is correct and the comment explaining *why* (`returning true consumes the event`) is exactly the kind of "why" comment that should stay. Proper listener cleanup. Deliberately leaves iOS swipe-back enabled with a rationale.

---

## index / Welcome (`app/onboarding/index.tsx`)
**Severity:** Low

### Issues
- [Low] `handleRestore` surfaces raw error strings into the UI (`Restore failed: ${err.message}`). Fine for beta diagnostics, but raw messages can leak internals; consider a friendlier message with details logged separately.
- [Low] `restoreMsg.startsWith('Restore failed')` is stringly-typed state — the success/error distinction rides on a message prefix. A `{ status: 'ok' | 'error', text }` shape would be safer than string-matching for styling.

### Strengths
- Good async handling: `restoring` disables the button, errors caught at every layer (`instanceof Error` guard), `finally` resets state. Conditionally shows restore only when a cloud session exists.

---

## income (`app/onboarding/income.tsx`)
**Severity:** Low

### Issues
- [Low] `canContinue` logic: the salary branch and mixed branch are identical (`salary.length > 0`), so the first two ternary arms collapse to `((mode === 'salary' || mode === 'mixed') && salary.length > 0)`. Minor simplification.
- [Low] Numeric inputs use `keyboardType="numeric"` and store raw strings without the decimal-sanitizing used in modals. Inconsistent input hygiene across the app — a shared numeric-input helper/hook would unify `amount` handling here, in modals, and in savings.

### Strengths
- Radio options as a typed `OPTIONS: RadioOption[]` constant with proper `accessibilityRole="radio"` + `checked` state is the correct pattern. `testID`s present for E2E. Passes state forward via route params cleanly.

---

## budget (`app/onboarding/budget.tsx`)
**Severity:** Medium

### Issues
- [Medium] `handleDone` does `insertProfile(...)` then `Promise.all(Object.entries(budgets).map(...))`. If `insertProfile` succeeds but a `updateCategory` rejects, the user has a profile but partial budgets and is left on the screen with a generic error — no way to know which saved. Not transactional. At minimum, note it; ideally batch in one DB transaction in the data layer.
- [Medium] Comment `// ⚠️ DB-02: insertProfile stub — replace with real drizzle insert` indicates `insertProfile` may be a stub. If so, onboarding completes without persisting the profile. Verify before shipping.
- [Low] `FlatList` nested directly in a flex `View` (not in a ScrollView) — correct here. `renderCategory` is defined inline in the component body (recreated each render); for a short category list it's fine, but `useCallback` would be consistent with best practice.
- [Low] `parseFloat(val)` with `isNaN || <= 0 → skip` silently drops invalid budgets without telling the user. Consider surfacing which were skipped.

### Strengths
- Reads route params with typed `useLocalSearchParams`, sensible fallbacks (`incomeMode ?? 'salary'`, `parseFloat(salary ?? '0') || undefined`). Good loading state and a `testID` on the done button for E2E.

---

## pin-setup (`app/onboarding/pin-setup.tsx`)
**Severity:** Medium

### Issues
- [Medium] **PIN hashed with bare SHA-256, no salt** (`Crypto.digestStringAsync(SHA256, confirmPin)`), identical to `lock.tsx`. A 6-digit PIN has 10^6 possibilities; an attacker with the stored hash brute-forces it in milliseconds. Use a salted KDF (store a random salt in SecureStore, or use `expo-crypto` with a per-install salt + many iterations). This is a security finding shared with `lock.tsx`.
- [Medium] This screen implements its **own keypad** (`DIGITS`, `handleDigit`) while `lock.tsx` uses the shared `PinPad` component with its own separate PIN logic. Two parallel PIN-entry + hashing implementations will drift. Reuse `PinPad` here and extract a shared `hashPin`/`savePin` helper (currently defined privately in `lock.tsx`).
- [Low] `handleConfirm` has no `catch` around the SecureStore write — if `setItemAsync` throws, `saving` resets in `finally` but the user silently isn't advanced and sees no error.

### Strengths
- Clean two-step enter→confirm state machine with mismatch recovery (resets to `enter`). Auto-advances on the 6th digit. Good a11y labels on keys and the dot row. `keyInvisible` for the layout gap is a tidy grid trick.

---

## biometrics (`app/onboarding/biometrics.tsx`)
**Severity:** Low

### Issues
- [Low] `handleEnable`'s `finally` calls `router.push('/onboarding/notifications')` **regardless of success or cancel** — correct intent (proceed either way), but if `authenticateAsync` succeeds the SecureStore write isn't awaited-then-navigated distinctly from the cancel path; both land identically. Acceptable, but a failed enable gives no feedback.
- [Low] Nested `.then()` in the mount effect (`hasHardwareAsync().then(... isEnrolledAsync().then(setSupported))`) — flatten to `async`/`await` for readability.

### Strengths
- Correctly gates the enable button on hardware + enrollment, with a graceful fallback message when unsupported. Skip path always available. Proper loading state.

---

## notifications (`app/onboarding/notifications.tsx`)
**Severity:** Low

### Issues
- [Low] Both handlers wrap `router.replace('/(tabs)')` in `setTimeout(..., 0)` with a comment about a "react-native-screens fragment race." This is a known workaround; keep the comment (it's a legit "why"), but note it as fragile — if the race resurfaces, the real fix is sequencing navigation after the permission promise fully settles rather than a 0ms defer.
- [Low] `handleEnable` swallows permission-request errors (no catch) — `requestNotificationPermission` failing would still navigate, which is probably desired, but a denied/failed permission gives no user signal.

### Strengths
- Simple, correct opt-in with loading state and an always-available skip. The `finally`-then-navigate ensures the user is never stuck on this screen.
