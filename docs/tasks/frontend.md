# GastosGo — Frontend Tasks (Expo Router + Gluestack UI)

Layer: **FE**
All tasks are independent within this layer. Screen tasks can be built against mock/stub data; they do not need the DB or BE layers to be complete — but layer dependencies are noted for integration.

---

## FE-01: Theme Setup — Gluestack UI + NativeWind + Dark Mode

**Title:** Configure Gluestack UI v3, NativeWind v5, and system-aware dark mode

**Description:**
Create `theme/index.ts` with the GastosGo pastel color palette (Filipino pastel, Monzo-inspired). Wrap the app root in `GluestackUIProvider` with `colorScheme` derived from `useColorScheme()`. Expose a `useThemeStore` Zustand store that holds a `mode: "system" | "light" | "dark"` value and overrides the system default.

**Acceptance Criteria:**
- [ ] `GluestackUIProvider` wraps `app/_layout.tsx` with `mode` prop driven by the store
- [ ] `tailwind.config.ts` (NativeWind v5) includes the custom pastel color tokens: `primary`, `accent`, `surface`, `muted` with light and dark variants
- [ ] `useThemeStore` persists `mode` to `expo-secure-store` (or `AsyncStorage`) so manual override survives restart
- [ ] Switching mode in `useThemeStore` causes immediate visual update without app reload
- [ ] All Gluestack components use the theme tokens — no hardcoded hex values in component files

**Effort:** M
**Layer Dependencies:** None

---

## FE-02: Onboarding Flow

**Title:** Build the onboarding screens: welcome, income setup, and first budget

**Description:**
Create `app/onboarding/` with three screens: (1) welcome/value-prop, (2) income mode selection (salary/mixed/target) with salary input, (3) optional first category budget setup. On completion, write the profile row to SQLite and navigate to the dashboard. If a Supabase session already has data, offer to restore from cloud (calls `lib/restore.ts` from BE-09).

**Acceptance Criteria:**
- [ ] Three-screen flow with a progress indicator (step 1 of 3)
- [ ] Screen 1: app name, tagline, "Get Started" button
- [ ] Screen 2: income mode radio group; salary input shown only for `salary` and `mixed` modes; savings target input
- [ ] Screen 3: pre-populated default categories (from DB-07 seed) shown as chips; user can set a monthly budget per category inline
- [ ] On "Done": profile row inserted via DB-02 helpers, default categories seeded if not already present
- [ ] If `supabase.auth.getSession()` returns an existing upgraded account, show "Restore from cloud" option that calls `runRestore()`
- [ ] Onboarding is skipped on subsequent launches if `profiles` table has a row for the current user

**Effort:** L
**Layer Dependencies:** Requires: DB-02, DB-07, BE-04, BE-09

---

## FE-03: PIN / Biometric Lock Screen

**Title:** Implement 4–6 digit PIN setup, change, and biometric unlock screen

**Description:**
Create `app/lock.tsx` and `components/PinPad.tsx`. On first setup, user enters a 4–6 digit PIN twice to confirm and it is stored via `expo-secure-store`. On subsequent launches, the lock screen is shown before the app renders. Biometric unlock (Face ID / fingerprint) is offered if `expo-local-authentication` reports it is available and enrolled.

**Acceptance Criteria:**
- [ ] `components/PinPad.tsx` renders a numeric keypad with backspace and clear
- [ ] PIN stored with `SecureStore.setItemAsync("pin", hashedPin)` — hashed with SHA-256 (use `expo-crypto`)
- [ ] PIN entry locks out for 30 seconds after 5 consecutive failures (count stored in `AsyncStorage`)
- [ ] `expo-local-authentication.authenticateAsync()` offered if `hasHardwareAsync()` and `isEnrolledAsync()` both return true
- [ ] Biometric success bypasses PIN pad and navigates to app
- [ ] Lock screen is shown on cold start and when app returns from background (via `AppState` listener)
- [ ] "Change PIN" accessible from Settings screen (FE-13); requires current PIN to verify before setting new one

**Effort:** L
**Layer Dependencies:** None

---

## FE-04: Dashboard Screen

**Title:** Build the main dashboard screen with spend summary, budget health, savings gap, and upcoming bills

**Description:**
Create `app/(tabs)/index.tsx`. The dashboard is the app's home view. It composes four summary widgets: (1) total spend this month vs income, (2) budget health (most critical category), (3) savings gap, (4) upcoming bills in next 7 days. Below the widgets: a recent transactions list (last 5). All data via TanStack Query hooks wrapping the DB query helpers.

**Acceptance Criteria:**
- [ ] Total spend card: `₱ [spent]` with subtitle `₱ [remaining] left of ₱ [income]`
- [ ] Budget health card: shows the category closest to or over its limit with a mini progress bar
- [ ] Savings gap card: `Expected: ₱X | Actual: ₱Y | Gap: ₱Z` using DB-09 `getSavingsGap()`
- [ ] Upcoming bills widget: lists recurring rules due within 7 days from DB-10 `getRulesDueWithin(userId, 7)`
- [ ] Recent transactions: last 5 expenses from DB-08 `getRecentExpenses(userId, 5)` with category color dot, merchant, amount, date
- [ ] All widgets show skeleton loaders while data is loading
- [ ] Empty state shown when there are no expenses yet (friendly illustration + "Log your first expense" CTA)
- [ ] Pull-to-refresh invalidates all TanStack Query keys on this screen

**Effort:** L
**Layer Dependencies:** Requires: DB-08, DB-09, DB-10

---

## FE-05: Expense Logging Modal

**Title:** Build the add-expense modal with amount, category, merchant, payment method, and date fields

**Description:**
Create `app/modals/add-expense.tsx`. This is the primary data-entry screen, reachable from the FAB on every tab. Amount is entered first (large numeric input). Category is a horizontally scrollable chip list. Payment method is a segmented control (Cash / GCash / Card / Others). Date defaults to today with a date picker. On save, writes to SQLite and enqueues a sync entry.

**Acceptance Criteria:**
- [ ] Amount field is auto-focused on modal open; numeric keyboard; supports up to 2 decimal places
- [ ] Category chip list shows all user categories with icon and color; "New category" chip opens an inline mini-form
- [ ] Merchant input is optional free text
- [ ] Notes input is optional free text (multiline, max 200 chars)
- [ ] Payment method: segmented control with 4 options (Cash, GCash, Card, Others)
- [ ] Date: defaults to today; tapping opens `@react-native-community/datetimepicker` in `date` mode
- [ ] On "Save": calls `insertExpense()` (DB-08), calls `enqueue("insert", ...)` (DB-11), dismisses modal, invalidates dashboard and expenses query keys
- [ ] Validation: amount > 0 required; category required; all other fields optional
- [ ] "Cancel" button dismisses without saving (no confirm dialog — expense is not partial)

**Effort:** L
**Layer Dependencies:** Requires: DB-03, DB-08, DB-11

---

## FE-06: Expenses List Screen

**Title:** Build the expenses list screen with month navigation and category filter

**Description:**
Create `app/(tabs)/expenses.tsx`. Shows all expenses for the selected month as a grouped list (grouped by date descending). Month navigator arrows let the user step back/forward by month. A category filter chip row at the top narrows the list. Tapping an expense opens an edit sheet.

**Acceptance Criteria:**
- [ ] Month navigator: left/right arrows update selected month/year; label shows e.g. "November 2026"
- [ ] Expenses grouped by date with a sticky section header (e.g., "Today", "Yesterday", "Nov 2")
- [ ] Each row: category color dot, merchant (or category name if no merchant), amount right-aligned, payment method badge
- [ ] Category filter chips above the list; "All" chip selected by default; selecting a category filters in-place
- [ ] Swipe-left on a row reveals a "Delete" action (with confirmation) that calls `deleteExpense()` and enqueues a delete sync
- [ ] Tapping a row opens an edit bottom sheet (reuses FE-05 form pre-filled with expense data; on save calls `updateExpense()`)
- [ ] Empty state per month: "No expenses in [Month Year]"
- [ ] Pull-to-refresh invalidates the month's query

**Effort:** L
**Layer Dependencies:** Requires: DB-08

---

## FE-07: Category Budgets Screen

**Title:** Build the budgets screen with per-category progress bars and 80%/100% warning states

**Description:**
Create `app/(tabs)/budgets.tsx`. Lists all categories with a progress bar showing `spent / monthlyBudget`. Progress bar color changes: green < 80%, amber 80–99%, red >= 100%. Tapping a category shows a drill-down of its expenses for the current month. Month navigation matches FE-06.

**Acceptance Criteria:**
- [ ] Each category row: icon, name, `₱ spent / ₱ budget`, animated progress bar
- [ ] Progress bar color: green (< 80%), amber (>= 80% and < 100%), red (>= 100%)
- [ ] An amber or red category shows a warning icon and text (`"Near limit"` / `"Over budget"`)
- [ ] Tapping a category navigates to a filtered expense list (passes `categoryId` param; reuses FE-06 list component)
- [ ] "Edit Budget" button on each row opens an inline input to update the monthly budget (calls `updateCategory()`, updates immediately in UI via optimistic update)
- [ ] Categories with `monthlyBudget = 0` show `"No limit set"` instead of a progress bar
- [ ] Month navigator present (same behavior as FE-06)
- [ ] Data from `getBudgetProgress()` (DB-09)

**Effort:** L
**Layer Dependencies:** Requires: DB-09

---

## FE-08: Insights Screen — Pie Chart (by Category)

**Title:** Build the category spending pie chart using Victory Native XL

**Description:**
Create the pie chart section of `app/(tabs)/insights.tsx`. Shows spending distribution across categories for the selected month. Uses `VictoryPie` from Victory Native XL. Tapping a slice highlights it and shows the category's total and percent below the chart.

**Acceptance Criteria:**
- [ ] Pie chart renders with one slice per category that has spend > 0 in the selected month
- [ ] Each slice colored with the category's color from the DB
- [ ] A center label shows the total month spend
- [ ] Tapping a slice: slice scales up (Reanimated), legend below updates to show selected category name + amount + percent
- [ ] Legend below chart lists all categories with color dot, name, amount, percent
- [ ] Empty state if no expenses exist for the month
- [ ] Month navigator (same as FE-06/07)
- [ ] Data from `getBudgetProgress()` (DB-09) — reuses same query shape

**Effort:** M
**Layer Dependencies:** Requires: DB-09

---

## FE-09: Insights Screen — Bar Chart (Monthly vs Budget, 6 Months)

**Title:** Build the 6-month bar chart comparing actual spend vs budget using Victory Native XL

**Description:**
Add a bar chart section below the pie chart in `app/(tabs)/insights.tsx`. Shows the last 6 months as grouped bars: one bar for total budget, one for total spend. Allows the user to see trend over time. Uses `VictoryBar` or `VictoryChart` from Victory Native XL.

**Acceptance Criteria:**
- [ ] Chart shows exactly 6 months (current + 5 previous), labeled "Jan", "Feb" etc.
- [ ] Two bars per month: "Budget" (sum of all category budgets) and "Spent" (sum of expenses)
- [ ] Budget bar color: `primary`; Spent bar color: varies (green if under, red if over)
- [ ] Tapping a month bar group shows a tooltip with exact amounts
- [ ] Y-axis labeled in ₱, auto-scaled to the max value across all 6 months
- [ ] Data fetched by calling `getExpensesByMonth()` (DB-08) for each of the 6 months (6 queries via `useQueries`)

**Effort:** M
**Layer Dependencies:** Requires: DB-08, DB-09

---

## FE-10: Recurring Expenses Screen and Modal

**Title:** Build the recurring rules list screen and add-recurring modal

**Description:**
Create `app/(tabs)/expenses.tsx` recurring tab section (or a dedicated route) and `app/modals/add-recurring.tsx`. Lists active recurring rules with next due date and amount. Users can add, edit, deactivate, and mark a rule as paid for the current cycle (which advances `nextDueDate` and logs an expense).

**Acceptance Criteria:**
- [ ] Recurring rules list: name, amount, frequency badge, next due date, active/inactive toggle
- [ ] "Mark as Paid" button on each rule: calls `advanceNextDueDate()` (DB-10) and `insertExpense()` for the amount (DB-08), then enqueues both sync operations
- [ ] Add modal (`add-recurring.tsx`): name, amount, category, frequency (daily/weekly/monthly/yearly), first due date
- [ ] Frequency selector is a segmented control or picker
- [ ] Edit: tap a rule to pre-fill the modal; on save calls `updateRecurringRule()` (DB-10)
- [ ] Deactivate toggle: calls `deactivateRule()` (DB-10); deactivated rules move to a collapsed "Inactive" section
- [ ] Empty state: "No recurring bills set up yet" with an add CTA

**Effort:** L
**Layer Dependencies:** Requires: DB-10, DB-08, DB-11

---

## FE-11: Savings Gap Tracker Screen

**Title:** Build the savings gap tracker screen supporting salary, mixed, and target income modes

**Description:**
Create a dedicated savings screen (or extend the dashboard) under `features/savings/`. Displays the savings gap calculation prominently. Allows the user to log income records for the month. The mode (salary/mixed/target) set in onboarding controls what inputs are shown.

**Acceptance Criteria:**
- [ ] Displays: `Expected Savings`, `Actual Savings`, `Gap` (positive gap = ahead, negative = behind), sourced from DB-09 `getSavingsGap()`
- [ ] `salary` mode: shows a single "Monthly Salary" field (pre-filled from profile); one income record per month
- [ ] `mixed` mode: shows an "Add Income Source" list (multiple records with source label + amount per month)
- [ ] `target` mode: shows "Savings Target" from profile; gap = target - actual savings (no income input needed)
- [ ] "Add Income" action inserts into `incomeRecords` via DB query helper and enqueues sync
- [ ] Month navigator (same as FE-06/07/08)
- [ ] All calculations done by DB-09 `getSavingsGap()` — no in-component arithmetic

**Effort:** L
**Layer Dependencies:** Requires: DB-09, DB-04

---

## FE-12: Push Notification Client Registration

**Title:** Implement Expo push notification permission request and token storage

**Description:**
Create `lib/notifications.ts`. On first launch (after onboarding), request notification permissions via `expo-notifications`. If granted, fetch the Expo push token and store it in both `AsyncStorage` (for local reuse) and in the Supabase `profiles.expo_push_token` column (for BE-07 to use). Set up notification received and response handlers.

**Acceptance Criteria:**
- [ ] `requestNotificationPermission()` calls `Notifications.requestPermissionsAsync()` and returns `granted: boolean`
- [ ] If granted, `Notifications.getExpoPushTokenAsync({ projectId })` retrieves the token using the EAS project ID from `app.json`
- [ ] Token is saved to Supabase `profiles` via upsert immediately after retrieval
- [ ] Token is also cached in `AsyncStorage` to avoid re-fetching on every launch
- [ ] A notification received while the app is foregrounded displays an in-app banner (using `Notifications.setNotificationHandler`)
- [ ] Tapping a notification from background navigates to the relevant screen (budget screen for budget alerts, recurring screen for bill reminders) via `Notifications.addNotificationResponseReceivedListener`
- [ ] Permission is requested only once; subsequent launches check `AsyncStorage` for existing token

**Effort:** M
**Layer Dependencies:** Requires: BE-04, BE-07

---

## FE-13: Settings Screen

**Title:** Build the settings screen for theme, PIN, income mode, and backup controls

**Description:**
Create `app/settings.tsx` (accessible from a header button or tab). Consolidates user-facing configuration: theme toggle, PIN change, income mode edit, manual "Backup Now" trigger, and an "About" section.

**Acceptance Criteria:**
- [ ] Theme row: "Light / System / Dark" segmented control; updates `useThemeStore` (FE-01)
- [ ] PIN row: "Change PIN" button navigates to `app/lock.tsx` in change-PIN mode (FE-03)
- [ ] "Disable PIN" toggle: clears the stored PIN from `SecureStore`; confirms with current PIN first
- [ ] Income Mode row: opens a bottom sheet to change mode (salary/mixed/target) + salary/target amount; updates `profiles` row
- [ ] "Backup Now" button: calls `runFullBackup()` (BE-06); shows a spinner then success/error toast
- [ ] Budget cycle start row: day picker (1–28); updates `profiles.budgetCycleStart`
- [ ] Currency row: currently display-only "PHP" (placeholder for future multi-currency)
- [ ] App version shown in About section

**Effort:** M
**Layer Dependencies:** Requires: BE-06, DB-02

---

## FE-14: Zustand Stores and TanStack Query Wiring

**Title:** Create Zustand stores and TanStack Query hooks for all data domains

**Description:**
Create `stores/` and `hooks/` files for each feature domain. Zustand stores hold ephemeral UI state (selected month, active filters, sync status). TanStack Query hooks wrap the DB query helpers for data fetching, caching, and invalidation. This is the data layer glue that all screen components consume.

**Acceptance Criteria:**
- [ ] `stores/uiStore.ts`: `selectedMonth`, `selectedYear`, `activeCategoryFilter` — shared across tabs via Zustand
- [ ] `stores/syncStore.ts`: `isSyncing`, `pendingCount`, `lastSyncedAt` — updated by the sync worker
- [ ] `hooks/useExpenses.ts`: `useQuery` wrapping `getExpensesByMonth()`, keyed by `[userId, month, year]`
- [ ] `hooks/useBudgets.ts`: `useQuery` wrapping `getBudgetProgress()`, same key shape
- [ ] `hooks/useSavings.ts`: `useQuery` wrapping `getSavingsGap()`, same key shape
- [ ] `hooks/useRecurring.ts`: `useQuery` wrapping `getRulesDueWithin()` and all rules
- [ ] All mutation hooks (`useAddExpense`, `useDeleteExpense`, etc.) invalidate the correct query keys on success
- [ ] `QueryClient` configured with `staleTime: 30_000` (30s) to avoid redundant DB reads on tab switches

**Effort:** M
**Layer Dependencies:** Requires: DB-08, DB-09, DB-10
