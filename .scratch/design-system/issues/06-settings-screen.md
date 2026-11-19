# 06: Settings screen + sub-screens

**What to build:** The Settings tab renders structured section cards matching the spec, with navigable rows for Income Mode and Budget Cycle, a styled Recently Deleted sub-screen, and "Coming Soon" badge rows for Recurring Rules and PIN & Biometric Lock. Income Mode and Budget Cycle each become push sub-screens.

**Blocked by:** 01, 02

**Status:** done

- [ ] Large title "Settings" (28px/800); scrollable
- [ ] **Income & Budget section card** — two list rows: "Income Mode" (shows current mode as subtitle) and "Budget Cycle" (shows current day as subtitle); each row: 36×36 icon slot, 16px/500 title, 13px gray subtitle, gray `›` chevron; press → `gray-light`; card has `sh-sm`, `border-radius: 16px`, rows separated by 0.5px border
- [ ] **Data section card** — "Recently Deleted" row; same row style
- [ ] **Upcoming section card** — "Recurring Rules" and "PIN & Biometric Lock" rows; each has an 11px/700 gold "SOON" badge; rows non-interactive (no press state, no chevron)
- [ ] **Footer** — app logo (brand gradient square, `border-radius: 20px`), "GastosGo" text, "Version 0.1.0" gray text; centered, padded
- [ ] **Income Mode sub-screen** (`app/settings/income-mode.tsx`) — NavBar "Income Mode"; same 3 mode cards as onboarding (no enter animation); fields rendered below selected card; Save/auto-save on selection
- [ ] **Budget Cycle sub-screen** (`app/settings/budget-cycle.tsx`) — NavBar "Budget Cycle"; preset option rows (1st, 5th, 10th, 15th, 20th, 25th) each as a list row with a checkmark when selected; custom number input below; saves `budgetCycleDay` via `saveSettings`
- [ ] **Recently Deleted sub-screen** (`app/settings/recently-deleted.tsx`) — info text "Items are kept for 30 days"; expense rows with Restore (`brand` bg, `brand-bg` on press) and Delete (`red` text, `red-bg` on press) small buttons (`padding: 7px 13px`, `border-radius: 10px`); empty state; migrated from the current inline list in `settings.tsx`
