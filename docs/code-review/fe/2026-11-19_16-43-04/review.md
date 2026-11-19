# Code Review: design-system/integration vs master
**Date:** 2026-11-19  
**Branch:** design-system/integration  
**Fixed point:** master (e6a32627)  
**Commits:** e445540 → c7f123b (design system pass, 9 tickets)

---

## Standards

### Hard violations (documented standards)

**Inline style objects in `.tsx` files** (CLAUDE.md / project convention: styles must live in `<file>.styles.ts`):

- `src/components/NavBar.tsx`: `<Animated.View style={{ transform: [{ scale: backScale }] }}>` — anonymous inline style object
- `src/components/TabBar.tsx`: `<Animated.View style={{ transform: [{ scale }] }}>` — same
- `app/(tabs)/index.tsx`: `{ backgroundColor: iconBg }` anonymous object in JSX; `${category?.color}22` hex string constructed inline
- `app/(tabs)/budgets.tsx`: `contentContainerStyle={{ paddingBottom: 32 }}` inline
- `app/settings/budget-cycle.tsx`: `pressed && { backgroundColor: colors.grayLight }` computed inline style in Pressable

This pattern is systematic across the branch — animated transform wrappers always use anonymous inline objects rather than `.styles.ts` entries.

### Judgement calls (baseline smells)

**Duplicated Code** — `ProgressBar` component is defined identically in both `app/(tabs)/index.tsx` and `app/(tabs)/budgets.tsx` (same props, same `Animated.timing` width logic). Should live in `src/components/ProgressBar.tsx`.

**Mysterious Name** — `deriveIncome` in `app/(tabs)/index.tsx` returns `settings.savingsTarget` when `incomeMode === 'target'`. The name implies income derivation but the return value is a savings target in that branch.

**Speculative Generality / fragile shared state** — `src/lib/categoryPickerBridge.ts` uses a module-level mutable `callback` variable for navigation-based prop passing. No lifecycle cleanup if navigation is interrupted mid-flow.

---

## Spec

### Missing or partial

**Ticket 02** — NavBar back button has no background circle on press:
> "back button (40×40 circle, brand `‹`, press = `scale(0.92)` + bg circle)"

**Ticket 03** — Savings Gap hero color does not animate (400ms transition):
> "teal (on-track) or red (at-risk), 400ms color transition; status pill (teal or red)"
`heroColor` is set as a static value; no `Animated.Value` interpolation.

**Ticket 05** — Budget carryover uses platform `<Switch>`, not a custom 250ms spring toggle:
> "Budget Carryover toggle (51×31px, off=`gray-2`, on=`green`, spring thumb 250ms)"

**Ticket 07** — Drag-to-dismiss velocity threshold and `overDragResistanceFactor` not wired:
> "velocity > 0.4px/ms OR drag > 100px → dismiss; rubberband resistance on upward drag (via `overDragResistanceFactor`)"

### Wrong implementation

**Tickets 03/05/09** — All progress bars use `Animated.timing(500ms)` not spring:
> "6px progress bar (spring-animated fill)" / "confirm all bars use spring (ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1))"
Timing easing ≠ spring; overshoot bounce is absent.

### No significant scope creep found.

---

**Summary:** Standards — 5 inline-style violations (hard) + 3 smells (judgement calls); worst: systematic inline styles across animated wrappers. Spec — 4 missing/partial requirements + 1 wrong implementation; worst: 400ms hero color transition on Savings Gap card is entirely absent.
