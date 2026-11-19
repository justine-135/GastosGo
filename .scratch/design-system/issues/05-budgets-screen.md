# 05: Budgets screen + Budget Edit push screen

**What to build:** The Budgets tab shows a Summary card and a list of styled budget rows with progress bars. The existing inline edit modal is replaced by a full push screen (Budget Edit) with a nav bar Save action, a name field, a monthly limit field, and a carryover toggle.

**Blocked by:** 01, 02

**Status:** done

- [ ] Large title "Budgets" + current month label; helper text "Tap a category to edit its limit" below the category list
- [ ] **Budgets Summary card** — `margin: 8px 20px 16px`, `border-radius: 16px`, `sh-sm`; ring decoration (180×180px brand ring, top-right, opacity 0.09); two-column: "Total Cap" left + "Spent" right (both 26px/800); 6px progress bar; spent text goes red when over cap
- [ ] **Budget rows** — `padding: 16px 20px`; 36×36 icon (`border-radius: 10px`); top line: name (15px/600) + "X% used" (13px gray) + amount spent (15px/700) right-aligned + "of ₱X" (12px gray); 6px progress bar (spring-animated, color by %: `<60%` teal, `60-85%` amber, `>85%` red); bar hidden if no limit set; press → `gray-light`
- [ ] **Budget Edit push screen** (`app/budget-edit.tsx`) — NavBar with category name as title + "Save" right action; Category Name text input; Monthly Limit peso input (optional); Budget Carryover toggle (51×31px, off=`gray-2`, on=`green`, spring thumb 250ms); Save writes via existing `updateCategoryBudget`; remove the existing `Modal`-based inline editor from `budgets.tsx`
- [ ] Progress bar fill animated with spring (500ms `ease-spring`) on mount and on value change
