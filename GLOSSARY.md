# GastosGo

Personal finance tracker for working Filipinos and students. Centers on the Savings Gap: showing users exactly why their month-end balance is lower than expected.

## Language

### Core financial concepts

**Expense**:
A single logged spending record with an amount, category, payment method, and date.
_Avoid_: transaction, purchase, gastos (use in marketing copy only, not in code)

**Savings Gap**:
`Actual Savings − Expected Savings`. Positive = saving more than expected (on track). Negative = saving less (at risk). What goes into each side depends on Income Mode:

| Income Mode | Actual Savings | Expected Savings |
|---|---|---|
| Salary | `Monthly Salary − Total Expenses` | the user's Expected Savings |
| Mixed | `(Salary + Freelance income) − Total Expenses` | the user's Expected Savings |
| Target | `Savings Target − Total Expenses` | `0` |

In Target Mode, Expected Savings is `0` — the Savings Target is already baked into Actual Savings, so the gap reduces to `Savings Target − Total Expenses`. Setting Expected Savings equal to the target there would cancel it out.
_Avoid_: savings difference, gap amount

**Expected Savings**:
The monthly savings figure the user commits to in Salary and Mixed modes — the baseline the Savings Gap is measured against. A first-class user input, entered during onboarding. Distinct from Savings Target, which is only used in Target Mode; Expected Savings is `0` in Target Mode. The value in effect at the start of a Budget Cycle is used for that entire cycle; changes take effect on the next cycle.
_Avoid_: savings goal, target savings (those are Savings Target)

**Savings Target**:
The savings goal set in Target Mode, where the user logs no income. Used as the basis for Actual Savings (`Savings Target − Total Expenses`), not as Expected Savings. Not used in Salary or Mixed mode.
_Avoid_: expected savings, savings goal

**Budget Cycle**:
The recurring period (default: calendar month) against which budgets and the savings gap are measured. Starts on a user-configured day of month; defaults to the 1st. Each cycle produces a Cycle Snapshot when it begins.
_Avoid_: month, billing period

**Cycle Snapshot**:
An immutable record created on the first app open of each new Budget Cycle, after the user reviews (and optionally updates) their income figures via a prompt. Captures the confirmed income figures (salary, freelance) and Expected Savings for that cycle. Used to correctly calculate the Savings Gap for past cycles.
_Avoid_: cycle record, income history, settings snapshot

**Income Mode**:
One of three user-selected configurations that determines how the savings gap is calculated: Salary, Mixed, or Target. Income figures (salary, freelance) are stored per Budget Cycle — the user may update them between cycles. The figure in effect at cycle start is used for that entire cycle; past cycle income is preserved as recorded.
_Avoid_: income type, savings mode

### Income modes

**Salary Mode**:
Income mode where the user logs a single fixed monthly income figure.

**Mixed Mode**:
Income mode where the user logs salary and freelance/irregular income as separate records.

**Target Mode**:
Income mode where the user sets a savings goal without logging income. Savings gap is calculated as `Savings Target − Total Expenses`.
_Avoid_: goal mode, no-income mode

### Categories and budgets

**Category**:
A label that groups expenses (e.g. Food, Transport). May have an optional Category Limit and Budget Carryover setting. 7 default categories are seeded on first launch; they are fully editable (name, limit, carryover) and deletable — "default" only means seeded, not locked.
_Avoid_: tag, label, group

**Category Limit**:
The optional monthly spending ceiling set on a single Category (e.g. ₱5,000 for Food). Only categories with a Category Limit set contribute to the Spending Cap.
_Avoid_: monthly limit, budget limit

**Spending Cap**:
The sum of all Category Limits for the current Budget Cycle. Only categories with a Category Limit set contribute. Used on the Home screen to show total remaining spendable amount (`Spending Cap − expenses in budgeted categories`).
_Avoid_: total budget, monthly cap

**Budget Carryover**:
A per-category opt-in setting that adds unused budget from one Budget Cycle to the next.
_Avoid_: rollover, carry-forward

### Recurring expenses

**Recurring Rule**:
A saved template that triggers an expense reminder or auto-logs an expense on a defined schedule (frequency + due date).
_Avoid_: recurring expense, subscription, standing order

**Remind Me**:
Recurring rule behaviour where the app notifies the user before the due date and waits for the user to confirm payment (logging the expense via Mark as Paid).
_Avoid_: manual log, reminder mode

**Auto-Log**:
Recurring rule behaviour where the app creates the expense automatically using the rule's stored amount, triggered on the first app open on or after the due date.
_Avoid_: automatic, silent log

### Payments

**Payment Method**:
A tag on an expense indicating how it was paid. MVP options: Cash, GCash, Card, Others (fixed set, shown as a segmented control). Custom payment method values are out of scope for MVP.
_Avoid_: wallet, account, source

### Security

**Lock Timeout**:
The duration of continuous app backgrounding after which the PIN or biometric lock screen is shown on next foreground. Configurable; defaults to 1 minute.
_Avoid_: inactivity timeout, auto-lock delay

### Data and sync

**Sync Queue**:
The local SQLite table of write operations (create/update/delete) that have not yet been replicated to Supabase. Persists across app restarts.
_Avoid_: offline queue, pending operations

**Recently Deleted**:
A Settings section that holds soft-deleted expenses for 30 days, allowing the user to restore them before permanent removal.
_Avoid_: trash, recycle bin, archive
