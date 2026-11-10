# Frontend Tasks — Code Review 2026-11-10 11:18:38

**Source report:** `docs/code-review/2026-11-10_11-18-38/review.md`
**Target agent:** `rn-frontend-engineer`

---

## TASK-FE-01: Move pie-slice dim style from inline object into insights.styles.ts

**Bug ref:** Review item 1 + 2 (opacity token + style location)
**Priority:** P2
**Type:** UX/UI
**Files touched:** `app/(tabs)/insights.styles.ts`, `app/(tabs)/insights.tsx`, `theme/index.ts`

### What's broken
`app/(tabs)/insights.tsx:183` applies a dim effect on unselected pie slices via an inline style object literal with a hardcoded `opacity: 0.4`. Two violations in one line: (1) a raw numeric design value that is not referenced from the theme, and (2) an inline `StyleSheet`-equivalent object inside a `.tsx` file. Project convention requires all design values to come from `theme/` token files and all styles to live in a co-located `.styles.ts` file.

### Reproduction steps
1. Open `app/(tabs)/insights.tsx` and search for `opacity: 0.4`.
2. Observe the inline style object on the `style` prop at line 183.
3. Open `theme/index.ts` and confirm there is no `opacity` export.

### Acceptance criteria
- [ ] `theme/index.ts` exports an `opacity` object (e.g. `export const opacity = { dim: 0.4 } as const`).
- [ ] `insights.styles.ts` defines a `sliceDimmed` rule that imports and uses `opacity.dim`.
- [ ] `insights.tsx:183` replaces the inline object with `styles.sliceDimmed`.
- [ ] No other inline numeric or color literals remain in `insights.tsx` (scan the full file).
- [ ] TypeScript compiles with no new errors.

### Technical notes
Current code at line 183:
```tsx
style={selectedId && slice.data.id !== selectedId ? { opacity: 0.4 } : undefined}
```
Target state:
```ts
// theme/index.ts — add alongside colors/spacing/radius
export const opacity = { dim: 0.4 } as const;

// insights.styles.ts — add rule
sliceDimmed: { opacity: opacity.dim }

// insights.tsx
style={selectedId && slice.data.id !== selectedId ? styles.sliceDimmed : undefined}
```
`theme/index.ts` already exports `colors`, `spacing`, `radius`, `typography`, `categoryColors` — add `opacity` in the same file following the same pattern.

### Dependencies
None — parallel-safe. TASK-FE-02 touches `insights.tsx` at a different line; if assigned to the same agent in the same session, do FE-01 first so the import list is settled before FE-02 adds its guard.

---

## TASK-FE-02: Guard slice.data.id against null before as-string cast in insights.tsx

**Bug ref:** Review item 3
**Priority:** P1
**Type:** BUG
**Files touched:** `app/(tabs)/insights.tsx`

### What's broken
`app/(tabs)/insights.tsx:184` casts `slice.data.id` to `string` unconditionally with `as string`, then passes it to `onSelect(id: string)`. Two lines above (161–167) the component already guards `categoryName` and `categoryColor` for the case where a slice belongs to an uncategorised expense (categoryId can be null). The `as string` cast silently passes `null` through the type system, which means `onSelect` receives a typed `string` that is actually `null` at runtime for any uncategorised slice. This can cause silent filter errors or a crash depending on what `onSelect` does downstream.

### Reproduction steps
1. Add an expense with no category (uncategorised).
2. Navigate to the Insights tab.
3. Tap the uncategorised slice in the pie chart.
4. Observe whether `onSelect(null)` causes a downstream error (selected slice state set to `null`, subsequent opacity filter behaves incorrectly).

### Acceptance criteria
- [ ] The slice `onPress` handler either (a) skips calling `onSelect` when `slice.data.id` is null/undefined, or (b) is guarded the same way `categoryName`/`categoryColor` are guarded at lines 161–167 (i.e. the slice is excluded from the chart data if its id would be null).
- [ ] The `as string` cast is removed or replaced with a type-safe guard.
- [ ] Tapping an uncategorised slice does not throw or silently corrupt filter state.
- [ ] TypeScript compiles with no new errors.

### Technical notes
Current code at line 184:
```tsx
onPress={() => { 'worklet'; runOnJS(onSelect)(slice.data.id as string); }}
```
Simplest fix — skip the callback when id is falsy:
```tsx
onPress={() => { 'worklet'; if (slice.data.id) runOnJS(onSelect)(slice.data.id); }}
```
Alternative — filter null-id slices out before building chart data (matches the label/color guard pattern already present). Check lines 161–167 to see the existing guard and mirror it.

This is a `'worklet'` function so keep any added logic as simple as possible; complex branching inside a worklet can cause Reanimated issues.

### Dependencies
⚠️ file conflict — `app/(tabs)/insights.tsx` is also touched by TASK-FE-01. Assign both tasks to the same agent, or sequence FE-02 after FE-01.

---

## TASK-FE-03: Confirm splash screen covers _layout.tsx null-render window on cold start

**Bug ref:** Review suggestion — _layout.tsx blank screen
**Priority:** P3
**Type:** INVESTIGATION
**Files touched:** `app/_layout.tsx`, `app.json` (read-only audit; no edit expected unless splash is misconfigured)

### What's broken
`app/_layout.tsx:62` returns `null` while `isAuthChecking` is true. On the happy path this is a few hundred milliseconds. On the fallback path (3-second timer) this is a full blank white screen for up to 3 seconds before the app renders. If the native splash screen is configured to persist until the first JS paint this is acceptable; if it dismisses early the user sees a blank screen.

### Reproduction steps
1. Open `app.json` and check `expo.splash` configuration — confirm `resizeMode` and that a splash image is set.
2. Check whether `expo-splash-screen` is installed and whether `SplashScreen.preventAutoHideAsync()` / `SplashScreen.hideAsync()` is called in `_layout.tsx` around the auth check.
3. Cold-start the app on a device or emulator with a throttled CPU (slow device simulation) and observe whether a blank frame is visible between native splash dismissal and first content render.

### Acceptance criteria
- [ ] Confirm `expo-splash-screen` is wired up and the splash persists until after `isAuthChecking` becomes false.
- [ ] If splash is not wired up: add a minimal `ActivityIndicator` centered on the screen as a fallback for the null-render window (one-line change).
- [ ] Document the finding in a comment on this task — no code change required if splash already covers the window.

### Technical notes
The reviewer noted: "If there's a splash/native launch screen covering this window, no action needed — just confirm the splash persists until first paint so users don't see blank."

The 3-second fallback timer in `_layout.tsx:42–60` is the worst-case duration. The timer cleanup only fires on unmount, not when auth resolves early (see TASK-FE-04 if the team wants to fix that). This task only validates the user-visible impact.

### Dependencies
None — parallel-safe. Read-only investigation; only add code if splash is confirmed absent.

---

## TASK-FE-05: Sweep codebase for hardcoded design values and replace with theme tokens

**Bug ref:** Design token convention — codebase-wide enforcement
**Priority:** P2
**Type:** UX/UI
**Files touched:** `theme/index.ts`, all `*.styles.ts` and `*.tsx` files under `app/`, `components/`, `features/`

### What's broken
The project convention requires **all** design values — colors, spacing, border radii, border widths, font sizes, opacity, and shadows — to come from `theme/` token files rather than being hardcoded inline. This rule applies to every screen, component, and feature file in the codebase without exception. Violations exist across `app/(tabs)/`, `app/onboarding/`, `app/modals/`, `components/`, and `features/`: raw hex strings (`'#fff'`, `'#333'`), numeric spacing literals (`8`, `16`, `24`), inline border radii (`borderRadius: 12`), hardcoded border widths (`borderWidth: 1`), and opacity values (`opacity: 0.4`, `opacity: 0.8`). Each hardcoded value is a divergence risk — visual changes must be hunted down file by file instead of updated once in `theme/`.

### Reproduction steps
1. Run the following search to surface violations across the codebase:
   - Colors: `grep -rn "'#[0-9a-fA-F]\|\"#[0-9a-fA-F]" app/ components/ features/ --include="*.ts" --include="*.tsx"`
   - Numeric spacing/radius: `grep -rn "borderRadius:\s*[0-9]\|padding:\s*[0-9]\|margin:\s*[0-9]\|gap:\s*[0-9]\|fontSize:\s*[0-9]" app/ components/ features/ --include="*.styles.ts"`
   - Border widths: `grep -rn "borderWidth:\s*[0-9]" app/ components/ features/ --include="*.styles.ts"`
   - Opacity: `grep -rn "opacity:\s*0\.[0-9]" app/ components/ features/ --include="*.styles.ts" --include="*.tsx"`
2. Review the matches and confirm none reference a token variable.

### Acceptance criteria
- [ ] All hardcoded hex color literals in `.tsx` and `.styles.ts` files are replaced with a variable from `theme/colors`.
- [ ] All hardcoded spacing/padding/margin/gap numbers that duplicate values already in `theme/spacing` are replaced with the token.
- [ ] All hardcoded `borderRadius` numbers that duplicate values already in `theme/radius` are replaced with the token.
- [ ] Any design value that has no existing token (e.g. a one-off border width, a new opacity level) gets a new named export added to the appropriate `theme/` file, then referenced — not left hardcoded.
- [ ] `theme/index.ts` re-exports any new token files so consumers can `import { opacity } from 'theme'`.
- [ ] No new inline `StyleSheet`-equivalent object literals introduced in `.tsx` files; all styles remain in co-located `.styles.ts` files.
- [ ] TypeScript compiles with no new errors after the sweep.

### Technical notes
Existing theme exports in `theme/index.ts`: `colors`, `spacing`, `radius`, `typography`, `categoryColors`. TASK-FE-01 will have already added `opacity.dim = 0.4` — do not duplicate it; extend the same `opacity` object for any additional levels found (e.g. `opacity.faint`, `opacity.disabled`).

**Scope is the entire codebase** — every file under `app/`, `components/`, and `features/` must be audited. This includes `app/onboarding/`, `app/modals/`, `app/settings.tsx`, `app/lock.tsx`, `components/BudgetProgressBar`, `components/CategoryChip`, `components/MonthNavigator`, `components/PinPad`, `components/SkeletonBox`, and `features/savings/SavingsScreen`. No file is exempt.

Do not replace a hardcoded value with a token if the token's numeric value is semantically different (e.g. a one-off layout hack that happens to equal `spacing.md` by coincidence). Match by intent, not value.

### Dependencies
⚠️ sequence after TASK-FE-01 — both touch `theme/index.ts` and `app/(tabs)/insights.tsx`/`insights.styles.ts`. FE-01 adds the `opacity` token; FE-05 must not re-add it or conflict on those files.

---

## TASK-FE-04: Clear _layout.tsx fallback timer when auth resolves before the 3s deadline

**Bug ref:** Review suggestion — double-render / dangling timer
**Priority:** P3
**Type:** BUG
**Files touched:** `app/_layout.tsx`

### What's broken
`app/_layout.tsx:42–60` has two effects: one that resolves auth and calls `setIsAuthChecking(false)`, and one that sets a 3-second safety timer that also calls `setIsAuthChecking(false)`. When auth resolves normally (fast path), the 3-second timer is left alive until the component unmounts — it fires a redundant `setIsAuthChecking(false)` setState call on already-false state. This is harmless today (React bails on no-op state updates) but holds a timer open for 3 seconds on every cold start and will trigger a "setState on unmounted component" warning if the component ever unmounts before the timer fires.

### Reproduction steps
1. Open `app/_layout.tsx` lines 42–60.
2. Observe that the fallback timer's cleanup only runs on unmount (`return () => clearTimeout(timer)`), not when the auth effect resolves early.
3. Add a `console.log` inside the timer callback — confirm it fires even when auth resolved in <1s.

### Acceptance criteria
- [ ] The fallback timer is cleared as soon as the auth effect resolves (i.e. when `navState?.key` is available and SecureStore resolves).
- [ ] No second `setIsAuthChecking(false)` call fires after auth has already resolved.
- [ ] Cold-start behavior is unchanged — the 3s fallback still fires if auth is stuck.
- [ ] TypeScript compiles with no new errors.

### Technical notes
Standard pattern: use a `useRef<ReturnType<typeof setTimeout>>` to hold the timer ID, set it in the fallback effect, and call `clearTimeout(timerRef.current)` at the end of the auth-resolve effect. Both effects must share the ref.

### Dependencies
⚠️ file conflict — `app/_layout.tsx` is also touched by TASK-FE-03 (read-only audit). FE-04 edits the file; sequence FE-04 after FE-03 to avoid conflicts, or assign both to the same agent.
