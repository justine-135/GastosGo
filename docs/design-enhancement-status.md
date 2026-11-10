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
Paused reason: **Figma MCP starter-plan tool-call rate limit hit (again, 2026-11-10).** `whoami` confirms the account (`tintin`) is on **starter tier across all three teams** — there is no higher-tier plan to switch to. The limit resets on a rolling time window that cannot be accelerated, OR requires a plan upgrade: https://www.figma.com/files/team/964370190402276542/all-projects?upgrade=mcp_rate_limit_paywall

The component source files have been re-read and specced (props + states below). The build is a single batched `use_figma` call once quota is available. **Do not retry until the quota window resets or the plan is upgraded** — a retry inside the window just burns the first available call on an error.

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

## Before Implementation Starts — Blocking Decision — RESOLVED 2026-11-10

**Decision: Option B — navy text (`foreground` `#2D3047`) on the unchanged `primary` `#F4A261`.**

Verified contrast ratios (WCAG 2.1 relative-luminance formula):

| Option | Button color | Text color | Measured contrast | Verdict |
|--------|-------------|------------|-------------------|---------|
| A — Darken button | `#B5621C` | `#FFFFFF` white | **4.44:1** | ✗ below 4.5:1 AA for normal text; only passes as large/bold text (3:1). Fragile. |
| **B — Dark text (chosen)** | `#F4A261` orange | `#2D3047` navy | **6.27:1** | ✅ passes AA for all text sizes with margin |

**Why Option B:**
- Passes AA comfortably at every text size; Option A fails the strict 4.5:1 threshold for normal text (4.44:1).
- Preserves the brand accent color (`primary` `#F4A261`) everywhere it appears as a fill.
- Reuses the existing `foreground` token — no new color needed.
- Generalizes to the **identical bug in `CategoryChip`**, which currently sets white (`#FFFFFF`) text on a filled category-color background when selected (`components/CategoryChip.tsx` → `labelSelected`). Navy on every category color also passes AA (yellow `#E9C46A` 7.73:1, teal `#A8DADC` 8.45:1, sage `#81B29A` 5.39:1). Option A would not fix this without also darkening every category color — a cascade.

**Code follow-ups for the implementation phase (NOT done in this design task):**
- Introduce a shared `onPrimary` / `onAccent` text token = `foreground` (`#2D3047`), and replace scattered white (`#FFFFFF`) button labels across `app/onboarding/*.tsx`, Save/CTA buttons, etc.
- Change `CategoryChip`'s `labelSelected` from `#FFFFFF` to `#2D3047` (and `labelSelected` for the selected `CategoryChip` background should keep the category color; contrast now holds).
- These edits were deliberately deferred: buttons are not yet tokenized (hardcoded `#F4A261` fills per screen), several target files are already modified in the working tree, and this is a design-handoff task — token/shared-component work belongs to the implementation phase per the spec's implementation order.

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
