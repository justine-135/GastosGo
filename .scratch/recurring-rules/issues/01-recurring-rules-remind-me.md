# 01: Recurring Rules — Remind Me (full feature)

**What to build:** Users can define recurring bills with a name, amount, Category, Payment Method, frequency (monthly/weekly), and day-of-period. An "Upcoming Bills" card on Home shows rules due within 7 days or overdue, with Mark as Paid (instantly logs an Expense and advances the due date) and Skip (advances without logging). A dedicated Recurring Rules screen lists all rules with create/edit via bottom sheet and deactivate/delete actions. The edge function advances stale due dates server-side so reminders keep firing. Multi-period-overdue rules show a missed-count badge and catch up to the future in one action.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Local SQLite migration adds `recurring_rules` table (id, name, amount, category_id, frequency, recurrence_day, next_due_date, behaviour, is_active, payment_method, created_at, updated_at)
- [x] Local SQLite migration adds `is_recurring` (boolean, default false) and `recurring_rule_id` (text, nullable) to expenses
- [x] Supabase migration adds `recurrence_day` (integer) and `behaviour` (text, default 'remind_me') to remote `recurring_rules`
- [x] `computeNextDueDate(recurrenceDay, frequency, fromDate)` pure function handles monthly clamping (31st → Feb 28), weekly wraparound, and always returns a future date
- [x] Tests for `computeNextDueDate`: monthly clamping, weekly wraparound, year boundary, advancing past today
- [x] Recurring rule CRUD (create, read, update, deactivate, hard-delete) with SyncQueue integration
- [x] Tests for CRUD: insert, update, deactivate, delete, verify SyncQueue entries
- [x] Mark as Paid creates a linked Expense (is_recurring=true, recurring_rule_id set) and advances next_due_date to the future (multi-period catch-up)
- [x] Skip advances next_due_date without creating an Expense
- [x] Tests for Mark as Paid and Skip: single-period, multi-period overdue, correct Expense fields
- [x] Missed-count computed at display time (periods between today and past next_due_date)
- [x] Recurring Rules screen: lists all rules (active + inactive), "+" button opens create sheet
- [x] Create/edit bottom sheet: name, amount, category, payment method, frequency toggle, day-of-period picker; active/inactive toggle on edit
- [x] Home "Upcoming Bills" card: rules due within 7 days + overdue, sorted ascending by next_due_date, with missed-count badge
- [x] Mark as Paid and Skip action buttons on each Home card row
- [x] Home card links to Recurring Rules screen
- [x] Edge function (`bill-reminders`) advances next_due_date for rules where due date is on or before today, after sending reminders
- [x] Category required in UI (even though DB column is nullable)
- [x] Payment method uses same fixed set as AddExpenseSheet (Cash, GCash, Card, Others)

## Answer

Implemented in PR #16 on branch `feat/recurring-rules-remind-me`, targeting `dev`.

Key files:
- `src/utils/computeNextDueDate.ts` — pure functions
- `src/db/recurringRules.ts` — full data layer
- `src/db/migrations.ts` — schema additions
- `supabase/migrations/20240004000000_add_recurring_rule_columns.sql`
- `app/recurring-rules.tsx` — Recurring Rules screen
- `src/components/RecurringRuleSheet.tsx` — Create/Edit sheet
- `app/(tabs)/index.tsx` — Upcoming Bills card
- `supabase/functions/bill-reminders/index.ts` — stale date advancement
- `__tests__/computeNextDueDate.test.ts` + `__tests__/recurringRules.test.ts` — 29 tests
