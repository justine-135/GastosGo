# GastosGo Design Enhancement — Implementation Spec

**Companion Figma file:** https://www.figma.com/design/MhDIM8cYfvQgJZyUI5G9E3 ("GastosGo Design Enhancement")
**Design tokens:** all names below are from `theme/index.ts` (`colors.light` / `colors.dark`, `spacing`, `radius`, `typography`). Component files must use Tailwind classes or these tokens — never hardcoded hex.
**Target device in mockups:** iPhone 16 Pro, 393×852pt. Verify layouts hold at 320pt width (small Android) and with Dynamic Type.

---

## How to read this document

Each screen section lists: **Changed / why**, **Tokens**, **Components**, **Accessibility**. "New component" means it does not exist in the codebase yet and must be built. Implement screen-by-screen in the order given (core flow first).

A new shared component set is introduced that several screens depend on — build these **first**:

### New shared components to build before screens

| Component | File (suggested) | Purpose | Used by |
|---|---|---|---|
| `Icon` | `components/Icon.tsx` | Thin wrapper over `@expo/vector-icons` Ionicons with a fixed 24px default and an `accessibilityLabel` passthrough. Replaces all emoji used as UI affordances. | Tab bar, settings button, nav chevrons, transaction chevrons |
| `NumPad` | `components/NumPad.tsx` | 3×4 in-app numeric pad (1-9, `.`, 0, ⌫). Reuses the visual language of the existing `PinPad`. Emits `onKey(key)`. | Add Expense, Add Recurring (amount entry) |
| `CategoryTile` | `components/CategoryTile.tsx` | 40×40 rounded tile, category color at 18% opacity background + emoji/icon. Replaces the 12×12 `categoryDot`. | Dashboard rows, Insights legend (optional) |
| `SummaryCard` | `components/SummaryCard.tsx` | Generic titled card (label + value + optional progress/sub). Used for dashboard widgets and the new Budgets total card. | Dashboard, Budgets |

Existing components to **modify in place** (do not rebuild): `CategoryChip`, `BudgetProgressBar`, `MonthNavigator`, `PinPad`, `SkeletonBox`, and the tab bar layout in `app/(tabs)/_layout.tsx`.

> **Note on `greeting()`:** add a small pure helper `utils/format.ts → greetingForHour(h: number): string` returning `"Good morning"` / `"Good afternoon"` / `"Good evening"`. One function, one unit test. Fixes UX issue #3.

---

## UX issue → screen coverage map

| # | Issue | Fixed in | How |
|---|---|---|---|
| 1 | Tab bar uses emoji icons, no a11y labels | `app/(tabs)/_layout.tsx` | Ionicons (`home`, `wallet`, `pie-chart`, `bar-chart`) + text labels + `tabBarAccessibilityLabel` |
| 2 | Settings button is ⚙️ emoji | Dashboard | `Icon name="settings-outline"` in 44×44 button |
| 3 | Static "Good day!" greeting | Dashboard | `greetingForHour()` time-based greeting |
| 4 | Dashboard grid is `flexWrap`, uneven | Dashboard | Explicit rows: full-width Total, 2-up row, full-width Bills |
| 5 | 12×12 transaction color dot too small | Dashboard | `CategoryTile` 40×40 tinted tile w/ emoji |
| 6 | Transaction rows not tappable | Dashboard | Wrap row in `TouchableOpacity` → edit, trailing chevron |
| 7 | Category chips give no scroll hint | Add Expense | Right-edge gradient fade overlay on chip scroller |
| 8 | PRD numpad vs system keyboard | Add Expense | New `NumPad` component for amount entry |
| 9 | Bar chart bars 10px, cramped | Insights | Taller bars (120px max height, 14px wide), card background |
| 10 | No month-end summary | Savings (see below) | Add "You saved ₱X of ₱Y" summary card |
| 11 | Budgets lacks total summary | Budgets | New total-budget `SummaryCard` header |
| 12 | Recurring "Mark Paid" too small | Add Recurring / Expenses | Promote to full-width primary action |
| 13 | Dark mode contrast unverified | All | Spec gives dark tokens per screen; verify at AA |

---

## 1. Dashboard — `app/(tabs)/index.tsx`

**Changed / why**
- **Greeting (issue #3):** replace static `"Good day! 👋"` with `` `${greetingForHour(new Date().getHours())}, ${userName} 👋` ``. If no name stored, drop the name: `"Good morning 👋"`.
- **Settings button (issue #2):** replace `<Text style={{fontSize:24}}>⚙️</Text>` with `<Icon name="settings-outline" size={24} color={colors.foreground} />`. Keep the existing 44×44 `settingsBtn` wrapper.
- **Widget grid (issue #4):** drop `flexWrap`. Structure: Total Spent (full width) → row of [Budget Alert | Savings Gap] → Bills Due (full width). Use explicit flex rows with `gap: spacing.sm (8)`.
- **Transaction rows (issues #5, #6):** replace 12×12 `categoryDot` with `CategoryTile` (40×40). Wrap each row in `TouchableOpacity` navigating to `/modals/add-expense` with the expense's params pre-filled (edit). Add trailing `Icon name="chevron-forward"` 20px in `mutedForeground`.

**Tokens**
- Screen bg: `colors.light.background` (#FFF8F0) / dark `colors.dark.background` (#1A1A2E)
- Cards: `surface` (#FFECD2 light / #16213E dark), border `border`, radius `radius.lg` (16), padding `spacing.md` (16), gap `spacing.sm` (8)
- Card elevation: shadow `{offset:{0,1}, opacity:0.06, radius:4}` (keep existing)
- Total amount: `typography.sizes.xxl` (32) `weights.bold`, color `foreground`
- Card label: `sizes.sm` (13) uppercase, `mutedForeground`
- Savings gap positive: `success` (#81B29A); negative: `destructive` (#E76F51)
- Category tile bg: category color at **18% opacity**; emoji 20px centered
- FAB: 60×60, `radius.full`, bg `primary` (#F4A261), FAB shadow (keep)

**Components**
- New: `Icon`, `CategoryTile`. Existing: `SkeletonBox`, `BudgetProgressBar`.
- FAB stays `position:absolute` bottom-right. Raise `bottom` to clear the tab bar (72) + 24 so it doesn't overlap the last transaction row (observed overlap in mockup).

**Accessibility**
- Settings button: `accessibilityRole="button"`, `accessibilityLabel="Open settings"`, 44×44 (met).
- Transaction row: `accessibilityRole="button"`, `accessibilityLabel={`${merchant}, ${formatPeso(amount)}, ${formatDate(date)}. Double tap to edit.`}`. Min height 44 (row is ~68 — met).
- Tab bar: see §13.
- Greeting text is decorative context — no special role; ensure it is read before cards in focus order.

---

## 2. Add Expense — `app/modals/add-expense.tsx`

**Changed / why**
- **Amount entry (issue #8):** PRD specifies a numpad; current code uses `keyboardType="decimal-pad"` (system keyboard). Add the new `NumPad` component docked at the bottom; drive the amount display (the existing large ₱ + value block) from `NumPad.onKey`. Keep `keyboardType` as a fallback only if `NumPad` is disabled. The large amount display stays: ₱ sign 36px `primary`, value 52px `bold` `foreground`, centered.
- **Category chip scroll hint (issue #7):** add a right-edge linear-gradient fade (transparent → `background`) over the horizontal chip `ScrollView` to signal more chips. ~40pt wide, non-interactive (`pointerEvents="none"`).
- Keep: Cancel/title/Save header, inline "+ New" dashed chip + mini-form, merchant input, notes textarea (200 char), payment segment (Cash/GCash/Card/Others), date button.

**Tokens**
- Header border-bottom: `border`, height row padding `spacing.md`
- ₱ sign: `sizes.xxl`-ish 36, `primary`; amount value 52 `bold` `foreground`
- Chip selected: category color @18% bg + `primary` border 1.5; unselected: `surface` bg + `border`
- "+ New" chip: dashed `border`, `mutedForeground` text
- Payment segment track: a muted fill (use `#F0EAE0` light equivalent → prefer `surface-alt` token `#FFECD2`/dark `#16213E`); active pill `surface` white + card shadow
- NumPad keys: `surface` bg, `border`, text `sizes.md`/`lg` `foreground`; ⌫ and `.` in `mutedForeground`
- Inputs: `surface` bg, `border` 1.5, radius `radius.md` (12), min-height 48

**Components**
- New: `NumPad`. Existing: `CategoryChip` (reuse as-is). `DateTimePicker` unchanged.

**Accessibility**
- NumPad keys: each `accessibilityRole="button"`, `accessibilityLabel` = digit or `"Decimal point"` / `"Delete"`. Keys 72×72 (met). Group container `accessibilityLabel="Amount keypad"`.
- Amount display: `accessibilityLabel={`Amount: ${amount || 'zero'} pesos`}`, `accessibilityLiveRegion="polite"` (Android) so it announces as digits are tapped.
- Chip fade overlay must have `accessibilityElementsHidden`/`importantForAccessibility="no-hide-descendants"` — purely visual.
- Save button already labeled; keep disabled state announced via `accessibilityState={{disabled: isSaving}}`.

---

## 3. Budgets — `app/(tabs)/budgets.tsx`

**Changed / why**
- **Total-budget summary (issue #11):** add a `SummaryCard` at the top (above the FlatList, below `MonthNavigator`): label "TOTAL BUDGET", value `₱{totalSpent} of ₱{totalLimit}`, a full-width progress bar, and a `{pct}% used` tag colored by state. Compute `totalSpent = Σ spent`, `totalLimit = Σ monthlyBudget`.
- Rows keep icon + name + spent/limit + `BudgetProgressBar` (height 10). Promote the "Edit ✏️" affordance to a tinted pill (`primary` @12% bg, `primary` text) for a clearer tap target.
- Progress bar color states unchanged: green `<80%`, amber `80–99%`, red `100%+` — map to `success` / `warning` / `destructive`.

**Tokens**
- Summary card: `surface`, `border`, `radius.lg`, `spacing.md` padding, card shadow
- Summary value: `sizes.xl` (24) `bold` `foreground`; % tag `sizes.sm` colored by state
- Progress fill: `success`/`warning`/`destructive`; track `surface-alt`
- Warning badges: 🚨 (over) / ⚠️ (near) — **keep as emoji inside text** but add `accessibilityLabel`; or swap to `Icon name="alert-circle"`/`"warning"` for consistency (recommended).
- Edit pill: `primary` @12% bg, `primary` text, radius `radius.sm`-ish (8), min-height 36 → **raise to 44 for touch target**.

**Components**
- New: `SummaryCard`. Existing: `MonthNavigator`, `BudgetProgressBar`, `SkeletonBox`.

**Accessibility**
- Keep existing rich row `accessibilityLabel` (it already summarizes spent/limit/over/near — good).
- Summary card: `accessibilityLabel={`Total budget: ${formatPeso(totalSpent)} of ${formatPeso(totalLimit)}, ${pct} percent used`}`.
- Edit pill min 44×44 (currently 36 — **fix**).
- Warning emoji: give the containing `Text` an `accessibilityLabel` ("Over budget" / "Near limit") since emoji alone is not reliably announced.

---

## 4. Insights — `app/(tabs)/insights.tsx`

**Changed / why**
- **Bar chart (issue #9):** current bars are 10px wide, cramped across 6 months. Redesign: single taller bars (max height ~120px, width 14px), paired budget+spent per month, inside a `surface` card. Keep budget `primary` + spent `success`/`destructive` (under/over). Keep tap-for-tooltip.
- Donut (victory-native `PolarChart`/`Pie`, 50% inner radius) unchanged structurally; center "Total ₱X" overlay kept. Mockup uses a 58% inner radius for a slightly thinner ring — optional.
- Legend rows unchanged (dot + name + amount + %); keep selected-row highlight `#FFF3E8` → prefer a `primary` @10% tint token.
- Slice-detail card unchanged (left border = category color).

**Tokens**
- Section titles: `sizes.lg` (20) `bold` `foreground`
- Donut center: label `sizes.sm` `mutedForeground`, amount `sizes.xl`/`xxl` `bold` `foreground`
- Legend selected bg: `primary` @10% (replaces hardcoded `#FFF3E8`)
- Bar budget: `primary`; spent under: `success`; spent over: `destructive`
- Bar card: `surface`, `border`, `radius.md`

**Components**
- Existing: `MonthNavigator`, `SkeletonBox`, victory-native `PolarChart`/`Pie`. Bar chart stays custom (no new component needed).

**Accessibility**
- Legend rows already `accessibilityRole="button"` + label + `accessibilityState.selected` — keep.
- Bar columns already labeled with month/budget/spent — keep. Ensure min tap target: each column ≥44 wide region (pad touch area if bars are 14px).
- Donut slices: victory `onPress` via `runOnJS` — add an `accessibilityLabel` on the chart wrapper summarizing top categories, since individual SVG slices aren't focusable by screen readers.

---

## 5–10. Onboarding — `app/onboarding/*`

**Shared system (all 6 steps)**
- **Step indicator:** 6 dots, inactive `border` 8×8, active `primary` widened to 24×8 pill (keep existing `dotActive` pattern). `accessibilityLabel="Step N of 6"` on the row.
- **Primary button:** full-width, `primary` bg, `radius.lg` (16), padding-v 18, min-height 56, text `sizes.md` (17) `bold` `#FFFFFF` (`text/on-accent`).
- **Secondary button:** outline, border `secondary` (teal) or `border`, same radius/height.
- Container: horizontal padding `spacing.lg` (24), `justifyContent:"space-between"`.

### 5. Welcome — `onboarding/index.tsx`
No structural change. Confirm: 💰 72px, "GastosGo" 40px (`sizes.xxxl`), bilingual tagline (Tagalog `mutedForeground` + English italic `primary`), conditional "☁️ Restore from cloud" secondary (only when `hasCloudSession`), "Get Started" primary. A11y labels already present — keep.

### 6. Income — `onboarding/income.tsx`
3 radio cards (Salary / Mixed / Target). Selected card: `primary` @10% bg + `primary` border 2 + filled radio; unselected: `surface` + `border` + hollow radio (border 2). Conditional input per selection (Salary → monthly salary ₱ field; Mixed → salary + freelance; Target → savings goal). Continue button disabled (`accessibilityState.disabled`) until valid.
- Radio: `accessibilityRole="radio"`, `accessibilityState={{checked}}`. Card tap target full-width ≥56.

### 7. Budget — `onboarding/budget.tsx`
FlatList of category rows: emoji 22 + name + inline ₱ amount field (border `primary` when focused). CTA "Done — Let's Go! 🚀" primary.
- Each amount field `accessibilityLabel={`Budget for ${name}`}`, `keyboardType="numeric"`.

### 8. PIN Setup — `onboarding/pin-setup.tsx`
🔒 56 + "Create a PIN" + subtitle. 6 PIN dots (filled `primary` / hollow `border` 2), 16×16. `PinPad` 3×4, 72×72 circular keys (1-9, C, 0, ⌫). Two-step enter→confirm (dynamic title).
- PIN dots container `accessibilityLabel={`${filledCount} of 6 digits entered`}`, `accessibilityLiveRegion="polite"`.
- `PinPad` keys already 72×72 (met); ensure each has digit/Clear/Delete label.

### 9. Biometrics — `onboarding/biometrics.tsx`
🔐 72 + "Faster, safer unlock" + subtitle. "Enable Biometrics" primary + "Skip" secondary (border `border`). Labels present.

### 10. Notifications — `onboarding/notifications.tsx`
🔔 72 + "Stay on budget" + subtitle. "Enable Notifications" primary + "Not now" secondary.

**Tokens (all onboarding):** bg `background`; titles `sizes.xxl` (32)/`xxxl` (40) `bold` `foreground`; body `sizes.base` (15) `mutedForeground`; buttons as shared system above.

---

## Dark mode (issue #13) — all screens

Tokens flip via `colors.dark`: `background` #1A1A2E, `surface` #16213E, `foreground` #E8E8E8, `border` #2D3A5A, `mutedForeground` #9CA3AF. **Accent colors stay identical** (`primary`, `secondary`, `accent`, `success`, `warning`, `destructive` are the same hex in both modes). Verify contrast:
- `foreground` #E8E8E8 on `surface` #16213E → ~12:1 (AA+ ✓)
- `mutedForeground` #9CA3AF on `background` #1A1A2E → ~5.5:1 (AA body ✓)
- `primary` #F4A261 text on `surface` dark → ~6:1 (✓); but `primary` as a **button fill** needs white text — #FFFFFF on #F4A261 is ~2.1:1 ✗ for small text. **Use `foreground`-dark (#2D3047-equivalent) or bold/large text on primary buttons**, or darken the button. Flag for design review — this affects every primary button in both modes.

> The Figma file has dark variants for Dashboard, Add Expense, Insights on the "Screens — Dark" page as reference. Dark is driven in code by the existing `colors.dark` tokens — no separate screens needed in RN.

---

## Remaining screens (not yet mocked — spec stubs for completeness)

These weren't built in Figma this round but follow the same token system:

- **Expenses tab** (`app/(tabs)/expenses.tsx`): dual tab switcher (Expenses/Recurring), `MonthNavigator`, category filter chips (add scroll fade per #7), SectionList with sticky date headers. Recurring tab (issue #12): promote "Mark Paid" from inline button to a **full-width primary action** per bill card; frequency badges use `accent` @15% pills.
- **Settings** (`app/settings.tsx`): grouped sections (Appearance theme segment, Security, Budget, Cloud Sync, Currency, About). Use the payment-segment pattern for theme toggle.
- **Lock / PIN verify** (`app/lock.tsx`): reuse `PinPad` + 6 dots; error/lockout message in `destructive`.
- **Savings** (`features/savings/SavingsScreen.tsx`) — **issue #10:** add a month-end summary card: "You saved ₱{actual} of ₱{expected} goal. Gap driven by: {top overspend category}." Color-bordered 3-card row (Expected/Actual/Gap) already specified in brief.
- **Add Recurring** (`app/modals/add-recurring.tsx`): same header + `NumPad` amount pattern as Add Expense; frequency segment (Daily/Weekly/Monthly/Yearly).

---

## Component modifications summary

| Component | Change |
|---|---|
| `app/(tabs)/_layout.tsx` | Replace emoji `tabBarIcon`s with Ionicons (`home`/`home-outline`, `wallet`, `pie-chart`, `bar-chart`); keep text labels; add `tabBarAccessibilityLabel` per tab (#1) |
| `CategoryChip` | No change (reused as-is in Add Expense) |
| `BudgetProgressBar` | No change (already 3-state color) |
| `MonthNavigator` | Swap ‹ › glyphs for `Icon name="chevron-back"/"chevron-forward"` 20px for crisp rendering |
| `PinPad` | No change; ensure per-key `accessibilityLabel` |
| `SkeletonBox` | No change |
| `utils/format.ts` | Add `greetingForHour(h)` (#3) |

## New components checklist

- [ ] `components/Icon.tsx` — Ionicons wrapper, 24px default, label passthrough
- [ ] `components/NumPad.tsx` — 3×4 amount pad, `onKey` (#8)
- [ ] `components/CategoryTile.tsx` — 40×40 tinted tile (#5)
- [ ] `components/SummaryCard.tsx` — titled card for Dashboard widgets + Budgets total (#11)
- [ ] `utils/format.ts` `greetingForHour()` + one unit test (#3)

---

## Known constraints / flags for the team

1. **Primary-button contrast (both modes):** white text on `primary` #F4A261 is ~2.1:1 — below AA for small text. Decide: darker button, or dark text on primary. Affects all primary CTAs. (Highest-priority a11y item.)
2. **Figma dark variants are separate frames**, not a mode toggle — the Figma starter plan caps collections to 1 mode, so dark colors live in a parallel `Color Dark` collection. This is a Figma-only artifact; in RN, dark mode is the existing `colors.dark` object. No code impact.
3. **Warning/status still use emoji** (🚨 ⚠️ 💰 🔔) intentionally for warmth/brand — but every emoji used as information carries an `accessibilityLabel`. Emoji used purely as UI controls (settings gear, tab icons, chevrons) are replaced with vector icons.
