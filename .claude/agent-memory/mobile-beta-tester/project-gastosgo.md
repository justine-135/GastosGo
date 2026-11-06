---
name: project-gastosgo
description: GastosGo app context — tech stack, DB status, known instabilities, and blocker history
metadata:
  type: project
---

GastosGo is a React Native / Expo 52 expense-tracking app for Filipino users (PHP peso). Target: iOS + Android. Local-first with Supabase sync.

**Stack:** Expo 52, expo-router v4, React Native 0.76.3, Zustand, React Query v5, Drizzle ORM + expo-sqlite, Supabase JS v2, NativeWind v4, GluestackUI v1.

**DB layer:** Real Drizzle + expo-sqlite (no longer stubbed as of 2026-11-06 session). `lib/db/stubs.ts` contains actual Drizzle queries against `db/client`.

**victory-native:** IS installed (confirmed 2026-11-06). `insights.tsx` pie chart import works.

**Startup blocker:** `expo-asset` not hoisted to top-level node_modules by default. Run `npm install expo-asset --legacy-peer-deps` before `npx expo start` or the Metro bundler crashes.

**Known package version mismatches at startup (non-fatal warnings):**
- @react-native-async-storage/async-storage: 2.2.0 (expected 1.23.1)
- expo-asset: 58.x (expected ~11.0.5)
- expo-crypto: 13.x (expected ~14.0.2)
- react-native-screens: 4.1.0 (expected ~4.4.0)

**How to apply:** Always run `npm install expo-asset --legacy-peer-deps` before starting the server on a fresh clone.

**All 4 Maestro E2E tests PASSING as of 2026-11-06:**
- `e2e/01-smoke.yaml` — app launch + dashboard render
- `e2e/02-onboarding.yaml` — full onboarding flow with 6-digit PIN
- `e2e/03-add-expense.yaml` — add expense with category, amount, merchant
- `e2e/04-navigation.yaml` — all 4 tabs load without crash

**Bugs fixed since 2026-11-05 session (7 of 9 open bugs resolved):**
- BUG-01: Lock screen redirect race — fixed (navState guard)
- BUG-02: PIN length mismatch — fixed (both sides 6-digit)
- BUG-05: userId mismatch — fixed (LOCAL_USER_ID constant)
- BUG-16: Budgets empty on fresh install — fixed (NULL userId guard in getBudgetProgress)
- BUG-17: Biometrics skip — fixed (flag is now read in lock screen)
- BUG-22: Timezone date labels — fixed (local offset applied)
- BUG-23: MonthNavigator infinite future — fixed (next button disabled at current month)
- BUG-24: New category not shown — fixed (query invalidation added)

**Still open bugs:**
- BUG-07: Recurring rules always show Cash payment method (schema has no paymentMethod column, shortcut documented)
- BUG-25: 6-month bar chart always shows zero budget bars (getMonthlyExpenseSummary filters eq(userId) but categories have NULL userId)
- BUG-26: insertCategory writes userId: null for user-created categories (shortcut acceptable for single-user, but causes BUG-25)

**Unstable areas:** recurring rules payment method (requires schema migration), 6-month bar chart budget bars (requires NULL userId guard same as getBudgetProgress).
