# GastosGo Design Enhancement — Status & Resume Guide

**Date paused:** 2026-11-09  
**Figma file:** https://www.figma.com/design/MhDIM8cYfvQgJZyUI5G9E3  
**Team:** tintin's team (`team::964370190402276542`)  
**Spec:** `docs/design-spec-enhancement.md`

---

## What Is Complete

### Design System (Figma page: "Design System")
- **Primitives** — 18 raw color variables (orange/500 `#F4A261`, teal/300 `#A8DADC`, sage/400 `#81B29A`, etc.)
- **Color (light)** + **Color Dark** collections — 12 semantic tokens each (`bg/background`, `bg/surface`, `text/primary`, `accent/primary`, `accent/danger`, etc.), all aliased to primitives
- **Spacing** — 4 / 8 / 16 / 24 / 32 / 48
- **Radius** — 6 / 12 / 16 / 24 / 9999
- **Text styles** — 9 sizes (11 → 40, Inter)
- **Effect styles** — Card elevation, FAB elevation

> **Plan note:** Figma starter tier caps collections to 1 mode each. Light and dark live in separate collections (`Color` and `Color Dark`) rather than a single switchable toggle. This does not affect the React Native implementation — both palettes already exist in `theme/index.ts`.

---

### Screens — Light (Figma page: "Screens — Light") — 15 frames

| # | Screen | File | UX Issues Fixed |
|---|--------|------|----------------|
| 1 | Dashboard | `app/(tabs)/index.tsx` | #1 vector tab bar+labels, #2 vector gear icon, #3 time-based greeting, #4 fixed 2×2 grid, #5 40px category tiles, #6 tappable rows+chevron |
| 2 | Add Expense | `app/modals/add-expense.tsx` | #7 scroll-fade hint on category chips, #8 in-app numpad (PRD gap) |
| 3 | Budgets | `app/(tabs)/budgets.tsx` | #11 total-budget summary header, color-coded progress bars, warning badges |
| 4 | Insights | `app/(tabs)/insights.tsx` | #9 taller bar chart, donut+center label, tappable legend, slice-detail card |
| 5 | Onboarding — Welcome | `app/onboarding/index.tsx` | Pill step indicator, bilingual hero |
| 6 | Onboarding — Income | `app/onboarding/income.tsx` | Radio card selection, conditional inputs |
| 7 | Onboarding — Budget | `app/onboarding/budget.tsx` | Per-category inline amount rows |
| 8 | Onboarding — PIN Setup | `app/onboarding/pin-setup.tsx` | 6-dot indicator, 72px circular numpad |
| 9 | Onboarding — Biometrics | `app/onboarding/biometrics.tsx` | Hardware-conditional UI |
| 10 | Onboarding — Notifications | `app/onboarding/notifications.tsx` | Simple opt-in pattern |
| 11 | Expenses | `app/(tabs)/expenses.tsx` | Vector tab switcher, scroll-fade filter chips, 40px category tiles |
| 12 | Settings | `app/settings.tsx` | Vector icons replacing text chevrons/emoji, grouped cards |
| 13 | Savings | `features/savings/SavingsScreen.tsx` | Month-end summary card (PRD issue #10) |
| 14 | Lock / PIN Verify | `app/lock.tsx` | Full PinPad, 6-dot indicator, lockout state |
| 15 | Add Recurring | `app/modals/add-recurring.tsx` | Same pattern as Add Expense, Frequency segment |

### Screens — Dark (Figma page: "Screens — Dark") — 3 frames
- Dashboard (dark)
- Add Expense (dark)
- Insights (dark)

---

## What Is Paused

### Component Mockups — NOT YET BUILT
Paused reason: **Figma MCP starter-plan tool-call rate limit hit.** The script was fully written from real source files and is ready to execute. One `use_figma` call will create the entire Components page.

Components to build on a new **"Components"** Figma page:

| Component | Source | States needed |
|-----------|--------|--------------|
| `SkeletonBox` | `components/SkeletonBox.tsx` | Pulse animation frame, various sizes |
| `CategoryChip` | `components/CategoryChip.tsx` | Unselected, selected × multiple category colors |
| `BudgetProgressBar` | `components/BudgetProgressBar.tsx` | <80% green, 80–99% amber, ≥100% red |
| `MonthNavigator` | `components/MonthNavigator.tsx` | Default, prev-disabled (future month), light+dark |
| `PinPad` | `components/PinPad.tsx` | Empty, partially filled, full, disabled |
| `Tab Bar` | `app/(tabs)/_layout.tsx` | All 4 tabs × active/inactive, light+dark |

### Dark Variants — OPTIONAL, NOT YET BUILT
- Expenses tab (dark)
- Settings (dark)

### Cosmetic Polish — MINOR DEBTS
These are fine for mockup fidelity but should be fixed before design handoff:
- Dashboard: FAB overlaps last transaction row slightly (nudge up ~8px)
- Budgets: Edit-pill opacity inconsistency
- BudgetProgressBar fills use absolute positioning in mockup (visual only)

---

## How to Resume

### To finish the component mockups
1. Wait for the Figma MCP rate-limit window to reset **or** upgrade the Figma plan
2. Open this project in Claude Code and say: **"Resume the component mockups in the GastosGo design enhancement Figma file"**
3. The agent has the script ready — it will create the Components page in one call

### To add remaining dark variants
Say: **"Add dark variants for the Expenses and Settings screens in the GastosGo Figma file"**

---

## Before Implementation Starts — Blocking Decision

**Primary button contrast fails WCAG AA.**  
White text (`#FFFFFF`) on `#F4A261` = ~2.1:1 contrast ratio. WCAG AA minimum for normal text is 4.5:1. This affects every primary CTA across the entire app (onboarding buttons, Save, Get Started, etc.).

Pick one before any screen is coded:

| Option | Button color | Text color | Contrast | Look |
|--------|-------------|------------|---------|------|
| A — Darken button | `#B5621C` | `#FFFFFF` white | ~4.6:1 ✅ | Deeper burnt orange |
| B — Dark text | `#F4A261` orange | `#2D3047` navy | ~4.8:1 ✅ | Current orange, navy label |

---

## Implementation Order (from spec)

1. **Resolve button contrast** (blocking — affects every screen)
2. **Build new shared components first:**
   - `Icon` — vector icon wrapper (Ionicons via `@expo/vector-icons`)
   - `NumPad` — in-app numpad for amount entry
   - `CategoryTile` — 40×40 tinted tile
   - `SummaryCard` — reusable dashboard widget
   - `greetingForHour()` utility — time-of-day greeting string
3. **Screens in order:** Dashboard → Add Expense → Budgets → Insights → Onboarding
4. **Remaining screens:** Expenses → Settings → Savings → Lock/PIN → Add Recurring

Full per-screen spec with exact tokens, component names, and accessibility annotations: `docs/design-spec-enhancement.md`
