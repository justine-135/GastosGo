# GastosGo

Personal finance tracker for working Filipinos and students. Centers on the Savings Gap: showing users exactly why their month-end balance is lower than expected.

## Language

### Core financial concepts

**Expense**:
A single logged spending record with an amount, category, payment method, and date.
_Avoid_: transaction, purchase, gastos (use in marketing copy only, not in code)

**Savings Gap**:
`Actual Savings − Expected Savings`. Positive = saving more than expected (on track). Negative = saving less (at risk). In Target Mode, `Actual Savings = Savings Target − Total Expenses`.
_Avoid_: savings difference, gap amount

**Budget Cycle**:
The recurring period (default: calendar month) against which budgets and the savings gap are measured. Starts on a user-configured day of month; defaults to the 1st.
_Avoid_: month, billing period

**Income Mode**:
One of three user-selected configurations that determines how the savings gap is calculated: Salary, Mixed, or Target.
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
A user-defined label that groups expenses (e.g. Food, Transport). May have an optional monthly spending limit. The 7 default categories are seeded on first launch.
_Avoid_: tag, label, group

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
A tag on an expense indicating how it was paid (Cash, GCash, Card, Others, or a user-defined custom value). Not a balance-tracking account.
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
