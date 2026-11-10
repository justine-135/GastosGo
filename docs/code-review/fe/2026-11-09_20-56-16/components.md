# Components Review

Reviewed: `BudgetProgressBar`, `CategoryChip`, `MonthNavigator`, `PinPad`, `SkeletonBox`.
(Note: all live in `components/`, not `app/components/` — the latter does not exist.)

---

## Cross-cutting (all 5 components)
**Severity:** Medium

### Issues
- [Medium] **Style convention not followed.** Every component has `StyleSheet.create(...)` inline in the same file. The project convention requires styles in a co-located `<name>.styles.ts` file (e.g. `BudgetProgressBar.styles.ts` next to `BudgetProgressBar.tsx`). Zero `.styles.ts` files exist in `components/` today.

---

## BudgetProgressBar (`components/BudgetProgressBar.tsx`)
**Severity:** Low

### Issues
- [Low] Not wrapped in `React.memo`. It renders inside `budgets.tsx` list rows and dashboard cards and re-renders whenever the parent re-renders even if `percent`/`height` are unchanged. Wrap: `export const BudgetProgressBar = React.memo(function BudgetProgressBar(...))`.
- [Low] `barColor()` uses raw hex (`#E76F51`, `#E9C46A`, `#81B29A`) and the thresholds `100`/`80` are magic numbers. These same three semantic colors (danger/warn/ok) and thresholds recur in `budgets.tsx` and `insights.tsx`. Extract to `theme/colors.ts` (e.g. `colors.danger`, `colors.warn`, `colors.ok`) and a `BUDGET_WARN_THRESHOLD = 80` constant so the rule lives in one place.
- [Info] `accessibilityValue` reports `clamped` (max 100), so a 150%-over budget reads as "100". Consider reporting the true percent in the label while clamping only the bar width.

### Strengths
- Correct `useNativeDriver: false` for width interpolation (width can't use the native driver) — a common mistake avoided.
- Proper `accessibilityRole="progressbar"` with `accessibilityValue`. Good.
- Clean separation of `clamped` (for width) vs `percent` (for color) — the >100% case is handled deliberately.

---

## CategoryChip (`components/CategoryChip.tsx`)
**Severity:** Low

### Issues
- [Low] Not wrapped in `React.memo`. It is rendered in a `.map()` inside horizontal scrollers in both modals; every keystroke in the amount field re-renders the whole chip row. Memoize it — but note the parent passes an inline `onPress={() => setSelectedCategoryId(cat.id)}`, so memo only helps if that callback is stabilized too (see modals doc).
- [Low] Label color `#2D3047` and selected color `#FFFFFF` are hardcoded; `category.color` correctly comes from data, but the static text colors should reference tokens.

### Strengths
- Clean, single-responsibility, correctly typed props with a sensible `selected = false` default and optional `style` passthrough.
- Good a11y: `accessibilityRole`, descriptive label, and `accessibilityState={{ selected }}`.

---

## MonthNavigator (`components/MonthNavigator.tsx`)
**Severity:** Low

### Issues
- [Low] `const store = useUIStore()` subscribes to the **entire** store, so this component re-renders on any UI-state change (including `activeCategoryFilter`, which it doesn't use). Prefer selective selectors: `const selectedMonth = useUIStore(s => s.selectedMonth)` etc., or a shallow-equality selector.
- [Low] `now` / `isCurrentMonth` are recomputed every render via `new Date()`. Cheap, but the "is this the current month" guard means the **Next** arrow is disabled for any future month too — intended, but worth a comment; the variable name `isCurrentMonth` is slightly misleading since it's true for current *or future*.
- [Low] Raw hex colors again (`#F4A261`, `#2D3047`, `#9CA3AF`).

### Strengths
- Nice API design: optional `month`/`year`/`onPrev`/`onNext` props let it be driven externally (Storybook/isolated) while defaulting to the store. This is the right level of abstraction.
- `hitSlop` on the arrows and correct `accessibilityState={{ disabled }}` — good touch-target and a11y hygiene.

---

## PinPad (`components/PinPad.tsx`)
**Severity:** Info

### Issues
- [Info] `onPress={() => handleKey(key)}` allocates a new closure per key per render. With 12 static keys this is negligible; leaving it is fine. If ever memoizing, pass the key via a stable handler.
- [Info] Hardcoded colors; same token note as everywhere.

### Strengths
- `handleKey` correctly memoized with the right dependency array. Keys are stable and unique. `disabled` wired through to both the `TouchableOpacity` and visual state. Clean, idiomatic — no changes needed.

---

## SkeletonBox (`components/SkeletonBox.tsx`)
**Severity:** Info

### Issues
- [Info] `accessibilityElementsHidden` hides it on iOS only; for Android parity add `importantForAccessibility="no-hide-descendants"`. Minor — skeletons are transient.
- [Info] Background `#E5D5C0` hardcoded (token note).

### Strengths
- Correct looping animation with `useNativeDriver: true` (opacity is native-driver-safe) and proper cleanup (`anim.stop()` on unmount). The `width` type `number | \`${number}%\`` is a precise, well-chosen type. This component is exemplary.
