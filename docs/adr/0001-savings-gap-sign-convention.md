# Savings Gap sign convention: positive = on track

The PRD (§7) defined the formula as `Savings Gap = Expected Savings − (Income − Total Expenses)`, which makes a positive value mean the user is *behind* target — the opposite of what the PRD's own sign labels said. We corrected the formula to `Savings Gap = Actual Savings − Expected Savings`, so a positive value means the user is saving *more* than expected (on track ✓) and a negative value means they are saving less (at risk ✗). This matches natural language ("I have a positive savings gap") and is the convention used in every UI label and notification copy in the app.

In Target Mode (no income logged), `Actual Savings` is defined as `Savings Target − Total Expenses`, so the gap formula still holds without requiring an income figure.

## Considered options

- `Gap = Expected − Actual`: positive = behind target. Rejected because "positive gap" reading as bad is counterintuitive and the PRD's own labels contradicted it.
