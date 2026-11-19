# 04: History screen

**What to build:** The History tab displays expenses grouped by date with styled date-group headers (including a day-total pill) and styled expense rows, matching the design spec. Tapping a row triggers soft-delete with a confirm dialog.

**Blocked by:** 01, 02

**Status:** done

- [ ] Large title "History" (28px/800, `letter-spacing: -1px`) + current month label (13px gray) pinned below the status bar
- [ ] Date-group headers: `padding: 20px 20px 8px`, 13px/600 gray uppercase, `letter-spacing: 0.04em`; right side: day-total pill (`gray-light` bg, navy `tabular-nums` text)
- [ ] Expense rows: 40×40 category icon (`border-radius: 12px`, bg = `${color}22`); 15px/500 name + 12px gray meta (date, payment method); 15px/600 amount right-aligned, `tabular-nums`, `−` prefix; `padding: 12px 20px`; press → `gray-light` (120ms)
- [ ] Rows grouped inside white `border-radius: 16px` cards with `sh-sm`; last row has no bottom border
- [ ] Tap expense row → confirm dialog → soft-delete (existing logic preserved)
- [ ] Empty state: 48px icon, 18px/700 title, 14px gray sub, `padding: 60px 40px`
- [ ] Category icon color and emoji sourced from `categoriesById` (load categories alongside expenses)
