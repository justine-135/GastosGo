---
name: project-gastosgo
description: GastosGo project context — stack, conventions, palette, folder layout, DB stub strategy
metadata:
  type: project
---

GastosGo is an offline-first personal finance tracker for Filipinos built with Expo Router + Gluestack UI v3 + NativeWind v5 + TanStack Query + Zustand + SQLite (expo-sqlite).

**Why:** Portfolio app targeting working Filipinos/students with Monzo-inspired pastel UI.

**How to apply:** Follow these conventions in every screen/component built for this project.

## Color tokens (never hardcode hex in components — use Tailwind classes or theme/index.ts)
- primary: #F4A261 (warm orange)
- secondary: #A8DADC (sea glass teal)
- accent: #E9C46A (golden yellow)
- background: #FFF8F0 (warm cream)  /  dark: #1A1A2E
- surface: #FFECD2 (peach card)     /  dark: #16213E
- foreground: #2D3047 (deep navy)   /  dark: #E8E8E8
- destructive: #E76F51 (coral)
- muted: #81B29A (sage green)
- border: #E5D5C0

## Stack decisions
- Zustand for client/UI state (uiStore: selectedMonth/year/filter, syncStore: sync status, themeStore: mode)
- TanStack Query staleTime: 30_000 — avoids redundant DB reads on tab switches
- DB stubs in lib/db/stubs.ts → re-exported from lib/db/index.ts; screens never import stubs directly
- expo-secure-store for PIN hash (SHA-256 via expo-crypto); AsyncStorage for lockout count + push token cache
- Victory Native XL for charts (VictoryPie / VictoryBar) — not yet installed, bar chart has View-based fallback
- Reanimated 3 for animations

## Folder layout
app/(tabs)/: index (dashboard), expenses (expenses+recurring), budgets, insights
app/onboarding/: index (welcome), income, budget
app/modals/: add-expense, add-recurring
app/lock.tsx, app/settings.tsx
components/: PinPad, CategoryChip, BudgetProgressBar, MonthNavigator, SkeletonBox
features/savings/: SavingsScreen
hooks/: useExpenses, useBudgets, useSavings, useRecurring
stores/: themeStore, uiStore, syncStore
lib/db/: index.ts (re-exports stubs), stubs.ts, types.ts
lib/notifications.ts, lib/restore.ts (stubs for BE-07/BE-09)
utils/format.ts (formatPeso, formatDate, getLast6Months, etc.)
theme/index.ts (JS color tokens)
global.css (CSS variable definitions), tailwind.config.ts

## USER_ID constant
All hooks and stubs use USER_ID = 'stub-user-001' until real auth is wired.

## Stubs deferred to real implementations
DB-02 insertProfile, DB-07 category seed, DB-08 insertExpense/updateExpense/deleteExpense,
DB-09 getBudgetProgress/getSavingsGap, DB-10 recurring CRUD, DB-11 enqueue sync,
BE-04 Supabase auth, BE-06 runFullBackup, BE-07 push token upsert, BE-09 runRestore
