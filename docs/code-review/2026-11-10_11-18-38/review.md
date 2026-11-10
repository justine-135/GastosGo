# Frontend Code Review — GastosGo

**Date:** 2026-11-10 11:18:38
**Reviewer:** react-code-reviewer
**Scope:** `git diff HEAD~5..HEAD` (on `master`), FE code files only
**Overall Assessment:** Good — ship-able with minor follow-ups

---

## Summary

This changeset is small and focused. Three `.tsx` files and `babel.config.js` were modified to: (1) wire up the Reanimated babel plugin and fix the pie-chart `onPress` worklet crash, (2) add an auth-check gate + E2E LogBox guard + migration-error UI in the root layout, and (3) relabel the onboarding "Skip" button to "Not now".

No critical issues. The root-layout auth gate is correct but has one subtle double-render concern worth noting, and there is one inline-style design-token nit in the pie chart. Styling convention (styles in co-located `.styles.ts`) is respected across all touched files.

**Design token rule (applies to all files):** Hardcoded numeric or color values (`0.4`, `'#fff'`, `16`, etc.) must not appear in component or style files. All design values — opacity, spacing, radius, color — must reference a variable from `theme/colors`, `theme/spacing`, or `theme/radius`. This keeps visual changes to one place and prevents divergence across screens.

---

## Files Reviewed

| File | Verdict |
|------|---------|
| `app/_layout.tsx` | Approve — one suggestion |
| `app/(tabs)/insights.tsx` | Approve — one nit |
| `app/onboarding/notifications.tsx` | Approve |
| `babel.config.js` | Approve |

---

## `babel.config.js`

**No issues.** `react-native-reanimated/plugin` is correctly placed last in the `plugins` array (the comment confirms intent), which is the documented requirement. Reanimated `~3.16.0` is present in `package.json`, so the plugin resolves. This is the root fix that makes the `insights.tsx` worklet change work.

**FYI:** Adding this plugin affects the whole app's transform, not just the diff. Reanimated recommends clearing the Metro cache (`expo start -c`) after adding it — flag to whoever runs the next build so they don't chase a phantom "worklet not found" error.

---

## `app/(tabs)/insights.tsx`

### warning — hardcoded design value; use a design token
`app/(tabs)/insights.tsx:183`
```tsx
style={selectedId && slice.data.id !== selectedId ? { opacity: 0.4 } : undefined}
```
`0.4` is a hardcoded magic number. All design values must come from the global token files (`theme/colors`, `theme/spacing`, `theme/radius`). Add an opacity token there (e.g. `opacity.dim = 0.4`) and reference it here, then move the rule into `insights.styles.ts` so it is not an inline object literal. This is the same dim-opacity value that any future screen might need — defining it once prevents divergence.

```ts
// theme/opacity.ts (new token file, or add to colors.ts)
export const opacity = { dim: 0.4 };

// insights.styles.ts
sliceDimmed: { opacity: opacity.dim }

// insights.tsx
style={selectedId && slice.data.id !== selectedId ? styles.sliceDimmed : undefined}
```

### Correctness — worklet fix is right
`app/(tabs)/insights.tsx:184`
```tsx
onPress={() => { 'worklet'; runOnJS(onSelect)(slice.data.id as string); }}
```
Wrapping the JS-thread callback in `runOnJS` from inside a `'worklet'` is the correct pattern for a Reanimated-driven gesture/press handler, and resolves the prior crash. `onSelect` is a stable prop from the parent, so no stale-closure risk here. Good.

**Nit:** the `slice.data.id as string` cast papers over the fact that `id` is typed `categoryId` upstream. If `categoryId` can ever be `null` (uncategorised — note line 161–167 explicitly guards `categoryName`/`categoryColor` for exactly that case), the cast will silently pass `null` to `onSelect(id: string)`. Worth confirming `categoryId` is non-null for every slice, or guarding it the same way the label/color are guarded two lines up.

---

## `app/_layout.tsx`

### suggestion — two independent timers can both flip `isAuthChecking`, risking a late render on a slow device
`app/_layout.tsx:42–60`

The auth effect sets `isAuthChecking(false)` once navigation + SecureStore resolve. A second effect sets a 3s fallback timer. On the normal path, the auth effect wins quickly and the 3s timer later fires a **second** `setIsAuthChecking(false)` — harmless (no-op on already-`false` state) but it keeps a timer alive for 3s on every cold start. The cleanup clears it on unmount only, not when auth resolves early. This is fine functionally; consider clearing the fallback timer once `navState?.key` resolves so you're not holding a timer unnecessarily. Low priority.

### FYI — `if (isAuthChecking) return null` renders nothing for up to 3s on the deadlock path
`app/_layout.tsx:62`

Returning `null` while checking means a blank screen. On the happy path this is a few hundred ms (acceptable). On the fallback path it's a full blank 3s before the app appears. If there's a splash/native launch screen covering this window, no action needed — just confirm the splash persists until first paint so users don't see blank. A lightweight loading indicator would be an alternative, but `null` under a splash is a legitimate choice.

### Correctness — error handling is solid
The `.catch(() => setIsAuthChecking(false))` on the SecureStore read (line 51) correctly prevents a permanently-gated app if SecureStore throws. The migration-error retry UI (64–89) is well-formed with proper `accessibilityRole="header"` and `accessibilityLabel` on the retry button. Good defensive work.

### FYI — E2E LogBox guard
`app/_layout.tsx:13` — `if (process.env.EXPO_E2E === 'true') LogBox.ignoreAllLogs(true);` is a reasonable, side-effect-at-module-load guard scoped to the E2E env var only. No impact on production builds. Fine.

---

## `app/onboarding/notifications.tsx`

**No issues.** Label and `accessibilityLabel` were changed together from "Skip" → "Not now" (line 61/63), keeping the accessible name in sync with the visible text — exactly right. Softer copy, no behavioral change to `handleSkip`.

---

## Verdict

Ship it. No critical or major issues. Follow-ups before next review cycle:

1. **Add `opacity` design tokens** to `theme/` and replace `0.4` in `insights.tsx` — apply the same rule to any other hardcoded numeric/color values found in the codebase.
2. **Move the dim style** out of the inline object into `insights.styles.ts`.
3. **Guard `slice.data.id`** against `null` before the `as string` cast, or confirm it is always non-null for pie slices.

Items 1 and 2 together enforce the global rule: **no raw design values in component or style files — always a token variable**.

Neither blocks merge, but item 1 should be tracked as a standing convention violation to fix codebase-wide.
