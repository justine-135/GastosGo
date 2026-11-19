# 03: Spending Cap + Budgets

**What to build:** A user can give Categories a monthly limit and configure their Budget Cycle, and the app shows per-Category spending against those limits plus a total remaining-spendable amount on Home derived from the Spending Cap.

**Blocked by:** 02

**Status:** done

- [ ] Budgets screen: set an optional monthly limit per Category; opt a Category into Budget Carryover; set Budget Cycle start day (default 1st)
- [ ] `spendingCap` (sum of budgeted Category limits for the cycle) and `budgetedSpent` (per-category spent vs limit) pure utils
- [ ] Unit tests: Spending Cap with no budgeted categories, per-category over/under limit, Budget Cycle boundary
- [ ] Home shows remaining spendable = `Spending Cap − expenses in budgeted categories`
