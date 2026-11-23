# Spec: Recurring Rules — Remind Me

Status: ready-for-agent

## Problem Statement

Working Filipinos and students forget to track recurring bills (electricity, Netflix, internet). These expenses silently erode the Savings Gap each month. Without a way to define recurring bills and get reminded, users either forget to log them entirely or lose track of which bills are due when.

## Solution

Let users define Recurring Rules — saved templates with a name, amount, Category, Payment Method, frequency (monthly/weekly), and due date. The app reminds the user 1 day before each due date via push notification (server-side, already partially built). On the Home screen, an "Upcoming Bills" card shows rules due within 7 days plus any overdue rules. The user can Mark as Paid (instantly logs an Expense) or Skip (advances to the next occurrence without logging). If the user is away for multiple cycles, the server advances `next_due_date` so reminders keep firing; when the user returns, they see an inline badge ("2 missed") and a single Mark as Paid logs one Expense for the current period.

## User Stories

1. As a user, I want to create a Recurring Rule with a name, amount, Category, Payment Method, and frequency, so that I don't have to remember my bills manually.
2. As a user creating a monthly rule, I want to pick a day-of-month (e.g. "every 15th"), so that the system computes the next due date for me.
3. As a user creating a weekly rule, I want to pick a day-of-week (e.g. "every Monday"), so that the system computes the next due date for me.
4. As a user, I want my monthly rule set on the 31st to fire on Feb 28 (or Apr 30, etc.), so that month-end bills still trigger in short months.
5. As a user, I want to see an "Upcoming Bills" card on the Home screen showing rules due within the next 7 days and any overdue rules, so that I know what's coming up.
6. As a user, I want the Upcoming Bills card sorted by due date ascending, so that overdue bills naturally appear first and upcoming bills are ordered by urgency.
7. As a user, I want to tap "Mark as Paid" on a rule and have an Expense logged instantly with the rule's amount, Category, and Payment Method, so that tracking a recurring bill is a single tap.
8. As a user, I want the Expense created by Mark as Paid to be linked back to the Recurring Rule (via `recurring_rule_id` and `is_recurring`), so that I can distinguish recurring from one-off expenses.
9. As a user, I want `next_due_date` to advance automatically after I Mark as Paid, so that the rule moves to its next occurrence without manual intervention.
10. As a user, I want to tap "Skip" on an overdue rule to advance it to the next occurrence without logging an Expense, so that I can move past bills I don't need to track.
11. As a user, I want to snooze a push notification to be re-reminded the next day, so that I can deal with the bill later without losing the reminder.
12. As a user, I want to see an inline badge (e.g. "2 missed") on a rule that is overdue by multiple periods, so that I know how many cycles I skipped.
13. As a user, I want Mark as Paid on a multi-period-overdue rule to log one Expense for the current period and advance past missed ones, so that I don't have to step through each missed cycle.
14. As a user, I want to view all my Recurring Rules on a dedicated screen accessible from the Home card, so that I can manage them in one place.
15. As a user, I want to create a new Recurring Rule via a bottom sheet on the Recurring Rules screen, so that the creation flow matches the existing Expense creation pattern.
16. As a user, I want to edit an existing Recurring Rule (name, amount, Category, frequency, etc.) and have changes apply to the next occurrence immediately, so that I can update bills without waiting.
17. As a user, I want to deactivate a Recurring Rule (pause it) without deleting it, so that I can temporarily stop reminders for seasonal bills.
18. As a user, I want to delete a Recurring Rule permanently, so that I can remove bills I no longer have.
19. As a user, I want deleted rules to be hard-deleted (not soft-deleted), since the Expenses they created still exist independently.
20. As a user, I want to create and edit rules while offline, so that I'm not blocked by connectivity.
21. As a user, I want rule changes to sync to Supabase via the existing SyncQueue, so that the server-side bill-reminders edge function can read them.
22. As a user, I accept that push reminders only fire for rules that have synced to Supabase, since the edge function reads from the remote database.

## Implementation Decisions

### Schema changes — local SQLite

- Add a `recurring_rules` table mirroring the Supabase schema minus `user_id`: `id` (text PK), `name` (text NOT NULL), `amount` (numeric NOT NULL), `category_id` (text, required at app level, FK to categories), `frequency` (text NOT NULL, constrained to `'monthly'` | `'weekly'`), `recurrence_day` (integer NOT NULL — 1–31 for monthly, 0–6 for weekly), `next_due_date` (text NOT NULL, YYYY-MM-DD), `behaviour` (text NOT NULL DEFAULT `'remind_me'`), `is_active` (boolean NOT NULL DEFAULT true), `payment_method` (text NOT NULL DEFAULT `'Cash'`), `created_at` (text NOT NULL), `updated_at` (text NOT NULL).
- Add `is_recurring` (boolean NOT NULL DEFAULT false) and `recurring_rule_id` (text, nullable) columns to the local `expenses` table.

### Schema changes — Supabase

- Add `recurrence_day` (integer NOT NULL) and `behaviour` (text NOT NULL DEFAULT `'remind_me'`) columns to the remote `recurring_rules` table via a new migration.
- No changes to the remote `expenses` table (already has `is_recurring` and `recurring_rule_id`).

### `next_due_date` computation

- A pure function `computeNextDueDate(recurrenceDay, frequency, fromDate)` computes the next occurrence:
  - Monthly: finds the next month where `recurrenceDay` is on or after `fromDate`, clamping to last day of month if `recurrenceDay` exceeds month length.
  - Weekly: finds the next occurrence of the given weekday (0=Sunday … 6=Saturday) on or after `fromDate`.
- Used at rule creation (from today) and after Mark as Paid / Skip (from current `next_due_date` + 1 day).

### Mark as Paid

- Creates an Expense with the rule's `amount`, `category_id`, `payment_method`, date = today, `is_recurring = true`, `recurring_rule_id = rule.id`.
- Advances `next_due_date` via `computeNextDueDate`. If the new date is still in the past (multi-period overdue), keeps advancing until it lands in the future.
- Queues both the new Expense insert and the rule update to SyncQueue.

### Skip

- Same as Mark as Paid but without creating an Expense. Advances `next_due_date` until it's in the future.

### Missed-payments badge

- Computed at display time: count how many periods fit between today and `next_due_date` when `next_due_date` is past. No stored counter.

### Edge function update

- After sending reminders, the `bill-reminders` edge function advances `next_due_date` for any rule whose `next_due_date` is on or before today. This ensures reminders keep firing even if the user doesn't open the app. No Expenses are created server-side.

### Sync

- Recurring rules follow the same offline-first SyncQueue pattern as Expenses. CRUD operations write locally first, then queue for Supabase sync.

### UI structure

- **Home screen**: "Upcoming Bills" card showing rules where `next_due_date` is within 7 days or overdue, sorted ascending by `next_due_date`. Each row shows rule name, amount, due date, and missed-count badge if applicable. "Mark as Paid" and "Skip" action buttons per row. Card links to the full Recurring Rules screen.
- **Recurring Rules screen**: full list of all rules (active and inactive), accessible from the Home card. "+" button opens the create sheet.
- **Create/Edit sheet**: bottom sheet (consistent with AddExpenseSheet) with fields: name, amount, category, payment method, frequency toggle (monthly/weekly), day-of-period picker (day-of-month or day-of-week depending on frequency). Active/inactive toggle on edit only.

### No local notifications

- Push reminders are server-side only (edge function). Rules created offline won't get reminders until synced. This trade-off is accepted to avoid local notification scheduling complexity.

### Behaviour column

- `behaviour` column defaults to `'remind_me'`. The app ignores `'auto_log'` until that feature is implemented in a future pass.

## Testing Decisions

- **Seam**: the data layer. All testable logic lives in pure functions and DB operations, not UI components. This matches the existing test strategy where `__tests__/db.test.ts`, `__tests__/syncQueue.test.ts`, and `__tests__/computeGap.test.ts` test the data layer directly.
- **What makes a good test**: test external behaviour (given these inputs, expect these outputs / these rows in the DB), not implementation details (which internal function was called).
- **Modules to test**:
  - `computeNextDueDate` — monthly clamping (31st in Feb → 28th), weekly wraparound, advancing past today, edge cases around year boundaries.
  - Recurring rule CRUD operations — insert, update, deactivate, delete, verify SyncQueue entries are created.
  - Mark as Paid — verify Expense is created with correct fields, `next_due_date` advances, multi-period catch-up advances to future.
  - Skip — verify no Expense created, `next_due_date` advances correctly.
  - Missed-count computation — given a `next_due_date` in the past, returns correct count of missed periods.
- **Prior art**: `__tests__/db.test.ts` (CRUD patterns), `__tests__/computeGap.test.ts` (pure function testing), `__tests__/syncQueue.test.ts` (sync queue integration).

## Out of Scope

- **Auto-Log behaviour**: automatic expense creation on app open. Future feature; `behaviour` column is pre-laid for it.
- **Local notifications**: no `expo-notifications` scheduling. Reminders are server-side push only.
- **Frequencies beyond monthly/weekly**: biweekly, yearly, custom intervals. Text column allows future addition without schema changes.
- **"Make this recurring" from AddExpenseSheet**: creating a rule from an existing expense. Future nice-to-have.
- **Custom payment methods**: rules use the same fixed set (Cash, GCash, Card, Others) as Expenses.
- **Charts/insights for recurring spending**: no analytics view for recurring vs. one-off spending breakdown.
- **Notification permission prompts or onboarding**: the app already handles push registration; this feature doesn't add new permission flows.

## Further Notes

- The existing `supabase/functions/bill-reminders/index.ts` edge function already sends push notifications for rules due tomorrow. It needs a small addition to advance `next_due_date` for stale rules.
- The `behaviour` column and `recurrence_day` column are net-new to both local and remote schemas. The Supabase migration should be written to add these to the existing `recurring_rules` table.
- Category is required at the app level (enforced in the UI) even though the DB column is nullable — this is because Mark as Paid logs instantly without a review step, so the rule must have a Category pre-assigned.
