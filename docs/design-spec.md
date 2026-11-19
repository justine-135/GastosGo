# GastosGo — Design Spec

Extracted from `prototype/gastosgo.html`, `prototype/card-designs.html`, and `prototype/palette.html`.

---

## 1. Color Tokens

### Brand (Indigo-blue)
| Token | Value | Use |
|---|---|---|
| `brand` | `#4F6EF7` | Primary actions, active states, links |
| `brand-soft` | `#7389F9` | Button gradient start, FAB gradient start |
| `brand-bg` | `#EEF1FE` | Selected card bg, onboarding bg tint |
| Button gradient | `145deg, #7389F9 → #4F6EF7` | Primary button, FAB circle |

### Semantic
| Token | Value | Use |
|---|---|---|
| `green` | `#0D9488` (teal) | On Track state, progress safe (<60%) |
| `green-bg` | `#CCFBF1` | On Track pill bg |
| `amber` | `#D97706` | Warning (60–85% budget used) |
| `amber-bg` | `#FEF3C7` | Warning chip bg |
| `red` | `#EF4444` / `#DC2626` | At Risk state, danger (>85% budget used) |
| `red-bg` | `#FEE2E2` | At Risk pill bg |
| `gold` | `#F59E0B` | "Coming Soon" badges |
| `gold-bg` | `#FEF3C7` | "Coming Soon" badge bg |

> Progress bar color logic: `< 60%` → teal, `60–85%` → amber `#D97706`, `> 85%` → red `#DC2626`.

### Neutrals
| Token | Value | Use |
|---|---|---|
| `bg` | `#F7F7F9` | App background |
| `card` | `#FFFFFF` | Card surface |
| `navy` | `#111827` | Primary text |
| `gray` | `#6B7280` | Secondary text, labels |
| `gray-2` | `#D1D5DB` | Inactive icons, separators, placeholder text |
| `gray-light` | `#F3F4F6` | Input backgrounds, pressed row state |
| `sep` | `rgba(0,0,0,0.07)` | Row dividers |

---

## 2. Typography

Font: **Inter** (via Google Fonts). `font-feature-settings: "cv11","ss01"`. `-webkit-font-smoothing: antialiased`.

| Role | Size | Weight | Letter-spacing |
|---|---|---|---|
| Screen large title (History, Budgets, Settings) | 28px | 800 | −1px |
| Onboarding headline | 36px | 800 | −1.5px |
| Onboarding step title | 28px | 800 | −1px |
| Section header | 20px | 700 | −0.5px |
| Nav bar title | 17px | 600 | −0.4px |
| Mode card title | 16px | 700 | −0.3px |
| List row title | 16px | 500 | — |
| Body / input text | 16px | 400 | — |
| Amount input | 20px | 500 | −0.5px |
| Savings gap hero amount | 48px | 800 | −2.5px |
| Spending cap remaining | 24px | 800 | −1px |
| Budget summary totals | 26px | 800 | −1px |
| List row subtitle | 13px | 400 | — |
| Section label (uppercase) | 13px | 600 | 0.04em |
| Expense amount | 15px | 600 | −0.3px |
| Expense name | 15px | 500 | — |
| Expense meta | 12px | 400 | — |
| Status bar time | 15px | 700 | −0.3px |
| Tab label | 10px | 500 | — |
| "Coming Soon" badge | 11px | 700 | — |

All monetary values use `font-variant-numeric: tabular-nums`.

---

## 3. Layout & Spacing

Device frame: **390 × 844 px** (iPhone 14 Pro reference).  
Corner radius of frame: 48px.

| Constant | Value |
|---|---|
| Screen horizontal padding | 20px |
| Card border-radius (`--r`) | 16px |
| Small border-radius (`--r-sm`) | 10px |
| Pill border-radius | 100px |
| Status bar height | 44px |
| Nav bar total height | 96px (44px status + 52px bar) |
| Tab bar height | 83px (includes 20px bottom safe-area padding) |
| Scroll content top (with nav) | 96px |
| Scroll content top (no nav) | 44px |
| Screen bottom padding | 24px |

---

## 4. Elevation / Shadows

| Token | Value | Use |
|---|---|---|
| `sh-sm` | `0 1px 3px rgba(0,0,0,0.07), 0 2px 10px rgba(0,0,0,0.05)` | Standard cards, settings sections |
| `sh-md` | `0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)` | Savings Gap card |
| `sh-lg` | `0 16px 48px rgba(0,0,0,0.16)` | Bottom sheet |
| FAB shadow | `0 4px 16px rgba(79,110,247,0.40)` | Add button circle |

---

## 5. Animation System

### Easing Curves
| Name | Curve | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Most UI transitions |
| `ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | Exit/dismiss |
| `ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Bidirectional motion |
| `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Screen push, sheet enter |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Toggle thumb, progress bar, step dot |

### Timings
| Interaction | Duration | Curve |
|---|---|---|
| Screen enter (push) | 380ms | `ease-drawer` |
| Screen exit (slide back) | 260ms | `ease-in` |
| Tab switch (opacity only) | 80ms | `ease-out` |
| Bottom sheet enter | 380ms | `ease-drawer` |
| Bottom sheet exit | 220ms | `ease-in` |
| Modal overlay enter | 350ms | `ease-out` |
| Modal overlay exit | 200ms | `ease-out` |
| Button press (scale) | 120ms | `ease-out` |
| Button press (opacity) | 200ms | `ease-out` |
| Toggle thumb | 250ms | `ease-spring` |
| Progress bar width | 500ms | `ease-spring` |
| Row press background | 120ms | `ease-out` |
| Input focus ring | 150ms | `ease-out` |
| Semantic color transitions | 400ms | `ease-out` |

### Enter Animations (first-load only)
- **`gapEnter`**: `opacity 0→1, translateY(16px)→0, scale(0.98)→1`, 500ms `ease-out`.  
  Used on: Savings Gap card (60ms delay), Spending Cap card (120ms delay), onboarding title/sub, logo.
- **`cardEnter`**: `opacity 0→1, translateY(12px)→0, scale(0.97)→1`, 400ms `ease-out`.  
  Used on: Mode cards during onboarding only. Stagger: `index × 70ms`.

### Press States
- Primary button: `scale(0.97)`, shadow reduces.
- FAB circle: `scale(0.90)`, shadow reduces.
- Secondary button: `scale(0.97)`, bg darkens.
- Small button: `scale(0.95)`.
- Mode card: `scale(0.98)`.
- List/expense row: background → `gray-light`.
- Nav back button: background circle + `scale(0.92)`.

---

## 6. Component Inventory

### Nav Bar
- Height: 96px. Frosted glass: `rgba(250,250,248,0.85)`, `backdrop-filter: blur(20px) saturate(180%)`.
- 0.5px bottom border (`sep`).
- Back button: 40×40px circle, brand-colored `‹` (24px), scale + bg on press.
- Title: 17px/600, truncates with ellipsis.
- Right action: brand color, 17px/500, opacity on press.

### Tab Bar
- Height: 83px. Same frosted glass as nav bar. 0.5px top border.
- 4 tabs + center FAB add button.
- Tab: icon (24×24) + 10px/500 label. Inactive: `gray-2`. Active: brand.
- FAB: 50×50px circle, brand gradient, `+` icon (22×22, white, stroke-width 2.5).
- Tab icon press: `scale(0.9)` on SVG, 100ms.

### Cards
- `border-radius: 16px`, `background: white`, `sh-sm`.
- Section cards (Settings): `margin: 0 20px`, overflow hidden, children separated by 0.5px `sep` border.

### List Row
- `padding: 14px 20px`, `gap: 14px`. `background: white`. 0.5px bottom border. Press → `gray-light`.
- Icon slot: 36×36, `border-radius: 10px`.
- Body: flex:1, min-width:0 (overflow guard). Title 16px/500 navy, truncated. Subtitle 13px gray, truncated.
- Right: `gray-2` chevron `›` (14px) or action.

### Expense Row
- `padding: 12px 20px`, `gap: 14px`. Press → `gray-light`.
- Icon: 40×40, `border-radius: 12px`, bg = `${categoryColor}22` (10% opacity hex).
- Name: 15px/500 navy, truncated. Meta: 12px gray, truncated.
- Amount: 15px/600 navy, `tabular-nums`, right-aligned. Minus sign prepended (`−`, not `-`).

### Date Group Header (History)
- `padding: 20px 20px 8px`. 13px/600 gray uppercase, 0.04em spacing.
- Right: day total in pill — `gray-light` bg, navy text, `tabular-nums`.

### Budget Row
- `padding: 16px 20px`. Press → `gray-light`.
- Top: icon (36×36, `border-radius: 10px`) + name (15px/600) + "X% used" (13px gray). Right: amount spent (15px/700) + "of ₱X" (12px gray).
- Bottom: 6px progress track (only shown if limit is set).

### Progress Bar
- Track: 6px height, `gray-light`, `border-radius: 100px`.
- Fill: same height, color by budget %, `border-radius: 100px`, animated with spring.

### Savings Gap Card
- `margin: 60px 20px 0`. `border-radius: 24px`. `padding: 28px 24px 24px`. `sh-md`.
- Background decoration: **Option C — Ring + dot** (chosen in prototype): `::before` = 220×220px circle, 22px teal ring, `top: -70px, right: -70px`, `opacity: 0.1`; `::after` = 10px dot, `top: 10px, right: 20px`, `opacity: 0.2`. Both transition to green/red based on state.
- Label: 13px/600 gray uppercase.
- Hero amount: 48px/800, `letter-spacing: -2.5px`, green (on-track) or red (at-risk). Transition 400ms.
- Status pill: inline-flex, `border-radius: 100px`, 12px/700. Green `#CCFBF1 / #0D9488` or red `#FEE2E2 / #EF4444`.
- Status text: 13px gray.
- Detail rows: `padding: 7px 0`, 0.5px top border. Label 13px gray, value 14px/600 navy.

### Spending Cap Card
- `margin: 14px 20px 0`. `border-radius: 16px`. `padding: 20px`. `sh-sm`.
- Background decoration: **Option A — Arc bottom-right**: `::before` = 180×180px circle, 24px teal ring, `bottom: -70px, right: -70px`, `opacity: 0.08`.
- Header: label 13px/600 uppercase gray + subtext 12px gray. Right: remaining amount (24px/800) + "of ₱X cap" (12px gray).
- 6px progress bar.
- Per-category rows: emoji icon (15px), name (13px/500), inline mini progress bar (flex:1), remaining amount (13px/600, red if negative).

### Budgets Summary Card (Budgets tab)
- `margin: 8px 20px 16px`. `border-radius: 16px`. `padding: 16px 20px`. `sh-sm`.
- Background decoration: **Option B — Ring top-right**: `::before` = 180×180px circle, 22px brand ring, `top: -60px, right: -60px`, `opacity: 0.09`.
- Two-column: "Total Cap" left (26px/800), "Spent" right (26px/800, gray or red based on %). 6px progress bar below.

### Primary Button
- `width: 100%`, `padding: 16px`, `border-radius: 16px`. Brand gradient `145deg`. White text 17px/600. `sh: 0 4px 16px rgba(79,110,247,0.30)`. Disabled: `opacity: 0.38`.

### Secondary Button
- Same size. `gray-light` bg, navy text 17px/500.

### Small Button (Restore / Delete)
- `padding: 7px 13px`, `border-radius: 10px`, 14px/500.
- Restore: brand color, hover bg `brand-bg`.
- Delete: red color, hover bg `red-bg`.

### Input Field
- Label: 13px/600 gray uppercase, 0.03em spacing.
- Wrap: `gray-light` bg, `border-radius: 10px`, `padding: 14px 16px`. Focus: white bg + 2px brand ring.
- Prefix (`₱`): 20px/300 gray.
- Input text: 20px/500 navy, `tabular-nums`. Placeholder: `gray-2`.
- Small variant: 12px padding, 16px text.

### Segmented Control (Payment Method)
- `gray-light` bg, `border-radius: 10px`, 2px padding, 2px gap.
- Segment: 13px/500 gray. Active: white bg, navy 13px/600, `sh-sm`. Press (inactive): `rgba(0,0,0,0.04)` bg.

### Toggle
- 51×31px. Off: `gray-2`. On: `green`. Thumb: 27×27px white circle, `box-shadow: 0 2px 6px rgba(0,0,0,0.2)`. Spring transition 250ms.

### Mode Card (Onboarding / Settings)
- `border-radius: 16px`, white bg, 2px transparent border. `sh-sm`. `padding: 20px`. `gap: 16px`.
- Selected: 2px brand border + `brand-bg` bg.
- Icon slot: 44×44, `border-radius: 12px`.
- Title: 16px/700 navy. Desc: 13px gray, `line-height: 1.4`.
- Animate on enter (onboarding only): `cardEnter`, stagger `index × 70ms`.

### Bottom Sheet (Add Expense)
- `border-radius: 20px 20px 0 0`. White bg. `sh-lg`. Max height 92%.
- Handle: 36×4px, `gray-2`, `border-radius: 2px`, centered, 10px top margin.
- Header: 20px/700 title + 30×30 close button (circle, `gray-light` bg, gray `✕`).
- Scroll area + sticky action area (`padding: 12px 20px 24px`).
- Drag-to-dismiss: velocity > 0.4px/ms OR drag > 100px → dismiss. Rubberband on upward drag.
- Overlay: `rgba(0,0,0,0.42)` when open. Tap overlay to close.

### Empty State
- `padding: 60px 40px`. Icon 48px, title 18px/700 navy `−0.3px`, sub 14px gray `line-height 1.5`.

---

## 7. Screen Inventory

### Onboarding: Welcome (`screen-welcome`)
- Full-screen, `linear-gradient(165deg, #EEF1FE 0%, #F7F7F9 50%, #EEF1FE 100%)` bg.
- Logo: 64×64 brand gradient square, `border-radius: 20px`, 💸 emoji 32px. Shadow: `0 8px 24px rgba(255,99,72,0.32)`. (Note: shadow color in prototype is coral `rgba(255,99,72,...)` despite brand being indigo — intentional warm accent.)
- Eyebrow: 13px/700 brand uppercase. Headline: 36px/800 navy, `line-height: 1.08`, brand-colored span.
- Sub: 16px gray, `line-height: 1.5`.
- Feature pills: white bg, 1.5px `sep` border, pill shape, 13px/500.
- CTA: primary button "Get Started". Below: 13px gray "No account · Your data stays on your phone".
- Staggered enter: logo 100ms, eyebrow 160ms, title 200ms, sub 240ms, pills 300ms.

### Onboarding: Income Mode (`screen-income-mode`)
- Same bg. Transparent nav bar (no blur, no border). Back button visible.
- Step label: "Step 1 of 2", 13px/700 brand uppercase.
- Title: 28px/800 navy. Sub: 15px gray.
- 3 mode cards with `cardEnter` stagger.
- Step dots: 2 dots. Active: 20px wide, brand. Inactive: 6px, `gray-2`. Spring transition.
- Continue button disabled (opacity 0.38) until mode selected.

### Onboarding: Income Entry (`screen-income-entry`)
- Same pattern. Step 2 of 2.
- Fields vary by mode:
  - **Salary**: Monthly Salary + Expected Savings.
  - **Mixed**: Monthly Salary + Freelance/Other + Expected Savings.
  - **Target**: Savings Target only.
- CTA: "Start Tracking 🎉".

### Home Tab (`tab-home`)
- No nav bar. Status bar only (44px). Scrollable below status bar.
- **Savings Gap card** at top (margin 60px top to clear status bar).
- **Spending Cap card** below (14px gap).
- **Recent** section header + card with last 5 expenses.

### History Tab (`tab-history`)
- Large title "History" (28px/800) + month label (13px gray). Fixed at top 44–120px.
- Scrollable expense list grouped by date. Each group: date header + card of expense rows.
- Tap expense row → soft-delete (confirm dialog).
- Empty state if no expenses.

### Budgets Tab (`tab-budgets`)
- Large title "Budgets" + month label. Fixed header.
- Budgets Summary card (Total Cap vs Spent).
- Card with all categories as budget rows.
- Helper text below: "Tap a category to edit its limit".

### Settings Tab (`tab-settings`)
- Large title "Settings". Scrollable.
- **Income & Budget** section: Income Mode row + Budget Cycle row (both navigate to sub-screens).
- **Data** section: Recently Deleted row.
- **Upcoming** section: Recurring Rules (SOON) + PIN & Biometric Lock (SOON).
- Footer: app logo, "GastosGo", "Version 0.1.0 — Prototype".

### Add Expense Sheet (global overlay)
- Triggered by FAB. Fields: Amount, Category (picker nav), Payment Method (segmented), Date (defaults today), Notes (optional).
- Save button disabled until amount > 0 AND category selected.

### Category Picker (`screen-cat-picker`)
- Full-screen push (z-index 210, above sheet). Nav bar "Category" title + back.
- List of all categories. Selected shows brand `✓` checkmark. Tap → back to sheet.

### Budget Edit (`screen-budget-edit`)
- Nav bar with category name as title + "Save" action.
- Fields: Category Name (text), Monthly Limit (optional, ₱ prefix), Budget Carryover (toggle).

### Settings: Income Mode (`screen-settings-income`)
- Same 3 mode cards (no enter animation). Fields rendered below selected card.

### Settings: Budget Cycle (`screen-settings-cycle`)
- Preset options: 1st, 5th, 10th, 15th, 20th, 25th + custom number input.

### Settings: Recently Deleted (`screen-settings-deleted`)
- Info text: "Items are kept for 30 days."
- Expense rows with Restore / Delete buttons. Empty state if none.

### Placeholder Screens
- Recurring Rules: empty state, "Coming Soon".
- PIN & Biometric Lock: empty state, "Coming Soon".

---

## 8. Navigation Model

- Push stack: `navigate(id)` slides current screen to `translateX(-28%)` (slide-out) while new screen enters from right.
- `goBack()` reverses — removes active from current, restores previous from slide-out.
- Tab switching: opacity-only (80ms), no position change.
- Sheet is a separate layer (z-index 201), not part of the push stack.

---

## 9. Default Categories

| Icon | Name | Color | Default Limit |
|---|---|---|---|
| 🍜 | Food | `#FF6348` | ₱5,000 |
| 🚌 | Transport | `#3B82F6` | ₱2,000 |
| 🎬 | Entertainment | `#8B5CF6` | ₱1,500 |
| ⚡ | Utilities | `#F59E0B` | ₱3,000 |
| 💊 | Health | `#10B981` | ₱2,000 |
| 🛍 | Shopping | `#EC4899` | ₱3,000 |
| 📦 | Others | `#8E8E93` | None |

Category icon bg in rows/lists: `${color}22` (hex with ~13% opacity).

---

## 10. Savings Gap Calculation

```
gap    = actual − expected
actual = income − totalSpent        (salary/mixed mode)
       = savingsTarget − totalSpent (target mode)
expected = user.expected            (salary/mixed mode)
         = 0                        (target mode)
```

- `gap ≥ 0` → "On Track" (teal, ✓ pill).
- `gap < 0` → "At Risk" (red, ⚠ pill).
- Display: `gap ≥ 0` shows positive amount; `gap < 0` shows `−` prefix.

---

## 11. What Is Not Yet Designed (Prototype Placeholders)

- Recurring Rules screen (content only shown as "Coming Soon").
- PIN / Biometric Lock screen (content only shown as "Coming Soon").
- Charts / Insights tab (not present in prototype — tab not in tab bar).
- Push notification UI.
- Dark mode (tokens noted in PRD but not implemented in prototype).
- Multi-month navigation (History and Budgets hardcoded to November 2026).
- Expense detail / edit screen (prototype only has delete via tap).
- Custom category creation UI.
