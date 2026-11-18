# 02: Savings Gap on Home

**What to build:** A user completes a short onboarding that sets their Income Mode and the baseline figure that mode needs (Expected Savings for Salary/Mixed, Savings Target for Target), and the Home screen then shows their Savings Gap with a clear on-track / at-risk reading that updates as they log expenses.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] 2-step onboarding stack: pick Income Mode (Salary / Mixed / Target); set Expected Savings or Savings Target accordingly; persisted to SQLite
- [ ] `computeGap` pure util: Savings Gap = `Actual Savings − Expected Savings`, positive = on track (ADR 0001); handles all three modes (Target → Expected = 0, Actual = `Savings Target − Total Expenses`)
- [ ] Unit tests for `computeGap`: all three modes + edge cases (zero income, negative gap)
- [ ] Home shows the Savings Gap with on-track/at-risk styling, updating when expenses change
