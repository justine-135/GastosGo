# Layout / Root Screens Review

Reviewed: `app/_layout.tsx`, `app/lock.tsx`, `app/settings.tsx`.

---

## Cross-cutting (`_layout`, `lock`, `settings`)
**Severity:** Medium

### Issues
- [Medium] **Style convention not followed.** `lock.tsx` and `settings.tsx` both have inline `StyleSheet.create(...)`. Each needs a co-located `lock.styles.ts` / `settings.styles.ts`. (`_layout.tsx` has no styles — compliant.)

---

## _layout / RootLayout (`app/_layout.tsx`)
**Severity:** High

### Issues
- [High] **No error boundary anywhere in the tree.** Any render throw in a screen (e.g. the possibly-stubbed `victory-native` in Insights, or a bad migration) white-screens the whole app with no recovery. Add a top-level `<ErrorBoundary>` (class component with `componentDidCatch`) wrapping the `<Stack>` that renders a fallback + "reload" affordance.
- [High] `runMigrations().catch(console.error)` — a failed DB migration is swallowed to the console. The app then renders normally against a broken/old schema, and every query fails downstream with confusing errors. Migrations are load-bearing: on failure you want a blocking error screen ("couldn't prepare your data"), not a silent log. The push-token `.catch(console.warn)` is acceptable to swallow (non-critical), but migrations are not.
- [Medium] The auth-check uses three separate effects and an `isAuthChecking` gate with a **3-second fallback timeout** that force-unblocks render if `navState` never initializes. This is a workaround for a navigation-readiness race. It works, but if `SecureStore.getItemAsync` is slow (>3s on a cold device), the lock screen redirect is skipped and the user briefly sees the app unlocked before the redirect lands. Consider gating on `navState?.key` alone and showing a splash until the PIN check resolves, rather than racing a timer.
- [Low] `staleTime: 30_000` default is set here and then redundantly repeated in every hook (see hooks.md) — keep it here, drop the duplicates.
- [Low] `effectiveMode` resolution is correct but inline; fine.

### Strengths
- Providers correctly ordered (`QueryClientProvider` → `GluestackUIProvider` → `Stack`). The `navState?.key` guard before `router.replace` is the right way to avoid "navigate before mount" crashes, and the comment explains why. Modal screens declared with `presentation: 'modal'`. The E2E `LogBox.ignoreAllLogs` guard behind an env flag is clean.

---

## lock (`app/lock.tsx`)
**Severity:** High

### Issues
- [High] **PIN stored as bare SHA-256 with no salt** (`hashPin` → `digestStringAsync(SHA256, pin)`). A 6-digit PIN is 10^6 preimages; the stored hash is brute-forced instantly if the device/secure-store is compromised. Use a salted, iterated KDF (random per-install salt in SecureStore + many rounds, or scrypt/PBKDF2 if available). Shared finding with `onboarding/pin-setup.tsx`, which must use the identical scheme.
- [Medium] The lockout counter (`FAIL_COUNT_KEY`, `LOCKOUT_UNTIL_KEY`) lives in **AsyncStorage**, not SecureStore. AsyncStorage is unencrypted and user-clearable — an attacker can reset the fail count / lockout by clearing app storage, defeating the 5-attempt brake. Store these in SecureStore alongside the PIN hash.
- [Medium] `submitPin` is a ~55-line branching state machine over `mode` × `step`. It's correct but dense (nested conditionals for verify/setup/change). Worth decomposing into `verifyPin()`, `setupPin()`, `changePin()` handlers dispatched by mode, per the "replace a chain of conditionals with a dispatcher" remedy. The comments help, but the `pin` vs `confirmPin` vs `entered` juggling is a bug-prone surface.
- [Low] `tryBiometric` and `checkLockout` are called from two effects and from the AppState listener; they're plain async functions recreated each render and referenced in effects without being in deps (intentional). Fine, but `useCallback` + documented deps would be cleaner.
- [Low] PIN entry logic here is a **third** PIN implementation (dashboard lock) distinct from `pin-setup.tsx`'s keypad. Consolidate around `PinPad` + a shared hashing/verify module.

### Strengths
- Genuinely thorough security UX: progressive lockout with countdown, re-lock on background→foreground via AppState, biometric opt-in gated on onboarding preference + hardware + enrollment, and a graceful "no PIN set" passthrough. Auto-submit on 6 digits with a small debounce. The `Mode`/`Step` types are documented. This is careful work; the issues are about *hardening* a solid design, not fixing broken logic.

---

## settings (`app/settings.tsx`)
**Severity:** Medium

### Issues
- [Medium] `handleBackup` passes **itself** as the Alert "Retry" `onPress`: `[{ text: 'Retry', onPress: handleBackup }, ...]`. Each failure re-invokes `handleBackup`, which on failure shows the same alert again — an unbounded recursive-retry loop driven by the user tapping Retry, with no backoff or attempt cap. Replace with a bounded retry or just re-enable the button and let the user tap again.
- [Low] `React.useEffect` is called as `React.useEffect(...)` (namespaced) while the rest of the file uses the `useState` import directly — inconsistent; import `useEffect`.
- [Low] Income-mode labels are defined **twice** with different values: `handleIncomeMode` uses `{ salary: 'Fixed Salary', mixed: 'Salary + Freelance', target: 'Savings Target' }` but the `SettingsRow value` inline uses `{ ... target: 'Target' }` (shortened). Same concept, two sources of truth — extract one `INCOME_MODE_LABELS` constant (also used in `onboarding/income.tsx`).
- [Low] `hasPIN` toggle: turning the switch **off** calls `handleDisablePIN`, but turning it **on** does nothing (no handler) — the switch is effectively one-way with no affordance to set a PIN from here. Either route "on" to `/lock?mode=setup` or disable the on-direction with a hint.
- [Low] The 372-line file mixes screen, three helper components, and a large StyleSheet. Acceptable, but `SettingsRow`/`SectionHeader`/`Divider` could move to a small shared module as settings grows.

### Strengths
- Clean composition with `SectionHeader`/`SettingsRow`/`Divider` primitives. Backup correctly checks for a Supabase session first. The day-picker `Modal` + `FlatList numColumns={7}` is a tidy calendar grid with full a11y (`selected` state, per-day labels). Theme segmented control uses `accessibilityRole="radio"` correctly. `appVersion` read from `expoConfig` with a fallback.
