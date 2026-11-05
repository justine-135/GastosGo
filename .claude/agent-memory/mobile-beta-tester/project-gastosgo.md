---
name: project-gastosgo
description: GastosGo app context — tech stack, DB status, known instabilities, and blocker history
metadata:
  type: project
---

GastosGo is a React Native / Expo 52 expense-tracking app for Filipino users (PHP peso). Target: iOS + Android. Local-first with Supabase sync.

**Stack:** Expo 52, expo-router v4, React Native 0.76.3, Zustand, React Query v5, Drizzle ORM + expo-sqlite (not yet installed), Supabase JS v2, NativeWind v4, GluestackUI v1.

**DB layer is fully stubbed** — `lib/db/index.ts` re-exports from `lib/db/stubs.ts`. All mutations return mock data in memory; nothing persists across restarts. Real drizzle-orm and expo-sqlite packages are not installed.

**Why:** drizzle-orm / expo-sqlite / drizzle-kit / victory-native are absent from node_modules. `npm install` fails with peer dep conflicts (victory-native). Use `--legacy-peer-deps` to resolve.

**Startup blocker:** `expo-asset` not hoisted to top-level node_modules by default. Run `npm install expo-asset --legacy-peer-deps` before `npx expo start` or the Metro bundler crashes.

**Known package version mismatches at startup (non-fatal warnings):**
- @react-native-async-storage/async-storage: 2.2.0 (expected 1.23.1)
- expo-asset: 58.x (expected ~11.0.5)
- expo-crypto: 13.x (expected ~14.0.2)
- react-native-screens: 4.1.0 (expected ~4.4.0)

**How to apply:** Always run `npm install expo-asset --legacy-peer-deps` before starting the server on a fresh clone.

**Critical known bugs (from beta test 2026-11-05, 25 total):**
- BUG-01: Lock screen redirect race on cold start — `router.replace('/lock')` fires before navigator is ready.
- BUG-02: PIN length mismatch — onboarding stores 6-digit hash; lock screen submits at 4 digits. Users locked out permanently.
- BUG-05: `USER_ID = 'stub-user-001'` in all hooks vs `userId = 'local-user'` written by `insertProfile` — all data reads return empty.
- BUG-07: `recurringRulesTable` has no `paymentMethod` column; always hardcoded to 'Cash'.
- BUG-16: `getBudgetProgress` filters by userId but default categories have `userId = NULL` — budgets always empty on fresh install.
- BUG-17: Biometrics enabled flag (`gastosgo-biometrics-enabled`) is written but never read by lock screen.
- BUG-22: `formatDate` parses ISO strings as UTC — "Today"/"Yesterday" labels wrong between midnight–8am PST.
- BUG-23: MonthNavigator has no future-date cap — users can browse infinitely into future months.
- BUG-24: `handleAddCategory` in add-expense modal does not invalidate categories query — new category not shown until modal reopen.

**Unstable areas:** onboarding flow (step counts wrong, no back-guard), lock screen (mode/step state machine), insights screen (6 redundant queries, pie interactivity wired but not connected), `victory-native` not installed (insights screen will crash Metro).

**Bug report location:** `docs/bugs/beta-test-2026-11-05.md` (25 bugs total)
