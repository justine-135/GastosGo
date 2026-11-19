# 01: Remove white background — transparent modal route

**What to build:** Opening the add-expense sheet no longer shows a white screen sliding up behind it. The tab screen the user was on stays fully visible, dimmed only by the gorhom backdrop. The Stack route contributes no background and no slide animation of its own.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Opening the add-expense sheet shows no white background sliding up behind it
- [ ] The tab screen (home, budgets, etc.) remains visible and dimmed behind the sheet
- [ ] The Stack screen registration for add-expense uses `presentation: 'transparentModal'`
- [ ] No other screens are affected
