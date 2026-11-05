# GastosGo — Bug Tracker

**Last updated:** 2026-11-05
**Source:** Mobile beta-tester smoke test (static analysis + Metro startup, commit `ba87090`)

---

## Critical

### BUG-01 — `drizzle-orm`, `expo-sqlite`, `drizzle-kit` not installed
**Severity:** Critical
**File:** `package.json`
**Description:** Core ORM and SQLite packages are absent. The app runs entirely on in-memory stubs — all data is lost on every restart. 15+ TypeScript errors across `db/` confirm the packages are missing.
**Error:** `TS2307: Cannot find module 'drizzle-orm'` (15 files)
**Fix:** Add `drizzle-orm`, `expo-sqlite`, and `drizzle-kit` to dependencies and resolve peer-dep conflict with `victory-native`.

---

### BUG-02 — `victory-native` peer dep conflict breaks `npm install`
**Severity:** Critical
**File:** `package.json`
**Description:** `npm install` (no flags) errors out due to `victory-native@^41.0.0` peer dep conflict with the installed React 18.3.1 + RN 0.76. Developers must use `--legacy-peer-deps`, which is undocumented.
**Fix:** Pin `victory-native` to a compatible version or add `legacy-peer-deps=true` to `.npmrc`.

---

## High

### BUG-03 — `GluestackUIProvider` wrong prop — dark mode broken
**Severity:** High
**File:** `app/_layout.tsx:30`
**Description:** `<GluestackUIProvider mode={effectiveMode}>` — the correct prop is `colorMode`, not `mode`. The dark mode toggle in Settings has no visual effect.
**Fix:** Change `mode` → `colorMode`.

---

### BUG-04 — All mutations are in-memory stubs — data lost on restart
**Severity:** High
**File:** Stubs layer (`lib/db/stubs.ts`)
**Description:** `insertExpense`, `updateCategory`, `insertRecurringRule`, and all other write operations resolve with fake data but never write to any storage. Violates the core PRD offline-first requirement.
**Fix:** Wire real Drizzle + SQLite queries (blocked on BUG-01).

---

### BUG-05 — `deleteExpense` enqueues wrong payload
**Severity:** High
**File:** `hooks/useExpenses.ts:77`
**Description:** `enqueue('delete', 'expenses', { id: date })` passes the ISO date string as `id` instead of the expense ID. Cloud deletes will target non-existent rows once sync is live.
**Fix:** Change `{ id: date }` → `{ id }`.

---

### BUG-06 — Onboarding skips PIN, biometrics, and notification steps
**Severity:** High
**File:** `app/onboarding/`
**Description:** Flow jumps directly from Budget to Dashboard (`router.replace('/(tabs)')`). Missing steps per PRD: PIN setup → Biometrics (optional) → Notifications (optional).
**Fix:** Add the three missing onboarding steps before redirecting to Dashboard.

---

### BUG-07 — No PIN routing guard on cold start
**Severity:** High
**File:** `app/_layout.tsx`
**Description:** `_layout.tsx` renders the tab navigator immediately with no auth check. The `/lock` screen exists and works in isolation but is never shown. The PIN lock feature is effectively disabled.
**Fix:** Add a `useEffect` in `_layout.tsx` that checks `SecureStore.getItemAsync('gastosgo-pin-hash')` and routes to `/lock` before rendering tabs.

---

## Medium

### BUG-08 — PIN toggle `onValueChange` type error — may not fire
**Severity:** Medium
**File:** `app/settings.tsx:149`
**Description:** `onValueChange={(v) => !v && handleDisablePIN()}` returns `boolean | Promise<void>`, which is not assignable to `void | Promise<void>`. May cause the toggle to animate back without firing the handler on some RN versions.
**Fix:** `onValueChange={(v) => { if (!v) handleDisablePIN(); }}`

---

### BUG-09 — Savings gap formula confirmed correct (non-bug)
**Severity:** Medium (informational)
**File:** `lib/db/stubs.ts:213–227`
**Description:** `gap = actualSavings - expectedSavings` where `actualSavings = totalIncome - totalExpenses`. Math matches PRD formula. Dashboard comparison logic is also correct. No action required.

---

### BUG-10 — Category filter chips overflow off-screen
**Severity:** Medium
**File:** `app/(tabs)/expenses.tsx:374`
**Description:** `filterRow` uses `flexWrap: 'nowrap'` with no `ScrollView`. With 7+ default categories, chips overflow off the right edge and become untappable.
**Fix:** Wrap chip row in `<ScrollView horizontal>` or change `flexWrap` to `'wrap'`.

---

### BUG-11 — Edit recurring rule form always blank
**Severity:** Medium
**File:** `app/modals/add-recurring.tsx`
**Description:** Edit mode sets `isEditing = true` from `params.ruleId` but never fetches the existing rule to pre-fill state. All fields open blank.
**Fix:** Add a `useQuery` for the rule by `ruleId` and seed state from it in a `useEffect`.

---

### BUG-12 — "Restore from cloud" button permanently hidden
**Severity:** Medium
**File:** `app/onboarding/index.tsx:10`
**Description:** `const hasCloudSession = false; // stub` is never replaced by a real `supabase.auth.getSession()` call. The restore button never appears.
**Note:** Code comment acknowledges `⚠️ BACKEND REQUIRED (BE-04)`.

---

### BUG-13 — Insights screen makes 18 DB calls for 6-month chart
**Severity:** Medium
**File:** `lib/db/stubs.ts:297`
**Description:** Each of 6 `getMonthlyExpenseSummary` calls invokes `getBudgetProgress` which re-calls `getExpensesByMonth` — 12 expense fetches + 6 budget fetches for the bar chart alone. Will be noticeable with real SQLite.
**Fix:** Inline totals calculation or accept pre-fetched data to avoid nested queries.

---

## Low

### BUG-14 — Pie chart is a segmented bar (known shortcut)
**Severity:** Low
**File:** `app/(tabs)/insights.tsx`
**Description:** Renders a horizontal segmented bar instead of the pie/donut chart required by PRD. Code comment acknowledges this as a shortcut pending `victory-native` installation.
**Fix:** Blocked on BUG-02 → BUG-01. Upgrade to `VictoryPie` once packages are installed.

---

### BUG-15 — Budget cycle day picker has only 3 hardcoded options
**Severity:** Low
**File:** `app/settings.tsx:88`
**Description:** Alert offers only Day 1, 15, 25. PRD requires any day 1–28.
**Fix:** Replace Alert with a `Picker` or `ActionSheet` with full 1–28 range.

---

### BUG-16 — `require('react-native')` inside render
**Severity:** Low
**File:** `app/(tabs)/_layout.tsx:53`
**Description:** `const { Text } = require('react-native')` inside the `TabIcon` component body re-evaluates on every render. Harmless (require is cached) but unconventional and will be flagged by linting.
**Fix:** Move to a static import at the top of the file.

---

## Install Issue

### INSTALL-01 — `expo-asset` not hoisted — Metro crashes on fresh install
**Severity:** Blocker (dev environment)
**Description:** `@expo/metro-config` does a direct `require('expo-asset/tools/hashAssetFiles')` and hard-crashes if `expo-asset` is not hoisted to `node_modules/`. Workaround: `npm install expo-asset --legacy-peer-deps`.
**Additional:** Non-fatal version mismatch warnings for `expo-crypto` (13.x vs 14.x), `react-native-screens` (4.1 vs 4.4), `@react-native-async-storage` (2.2 vs 1.23). Lockfile is out of sync with Expo 52 SDK.

---

## PRD Conformance Gaps

| PRD Requirement | Status | Notes |
|---|---|---|
| Splash → Income → Savings → Budget → PIN → Biometrics → Notifications → Dashboard | Partial | PIN, biometrics, notifications steps missing |
| PIN lock on cold start | Missing | No routing guard |
| Lock after 30s in background | Implemented | AppState listener in `lock.tsx` works |
| 5 failed attempts = 30s cooldown | Implemented | Correct |
| Expense saves offline instantly | Missing | Stubs only |
| 80%/100% budget push notification | Missing | Edge Function exists; client trigger not wired |
| Recurring bill reminder 1 day prior | Partial | Edge Function scaffold exists; local scheduling not wired |
| Pie/donut chart for spending by category | Missing | Segmented bar placeholder only |

---

## Recommended Fix Order

1. **BUG-02** — fix `victory-native` peer dep → clean `npm install`
2. **BUG-01** — install `drizzle-orm` + `expo-sqlite` → real persistence
3. **BUG-07** — add PIN routing guard on cold start
4. **BUG-03** — fix `GluestackUIProvider` prop (`mode` → `colorMode`)
5. **BUG-05** — fix delete sync queue payload
6. **BUG-06** — add PIN/biometrics/notification steps to onboarding
