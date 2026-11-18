# Spec: GastosGo MVP Build (epic)

Status: ready-for-agent

> Epic spec covering the full first-ship build of GastosGo, derived from
> `docs/tech-stack.md`. Implementation is split into numbered sub-issues under
> `issues/`, one per build-order step. This file is the shared context; each
> sub-issue carries its own acceptance criteria and `Blocked by:` ordering.

## Problem Statement

The prototypes (`prototype/gastosgo.html`, `card-designs.html`, `palette.html`)
and the Supabase backend exist, but the app itself was wiped for a fresh
implementation — there is no runnable app. A working Filipino or student who
wants to understand *why their month-end balance is lower than expected* has
nothing to install. The design, the domain language (`GLOSSARY.md`), and the
backend are all settled; what's missing is a shippable, offline-first mobile app
that realises them.

## Solution

Build the GastosGo MVP as a managed Expo (SDK 58) app, iPhone-first and
Android-ready, that is offline-first with local SQLite as the source of truth and
Supabase as the sync target. The user can onboard (pick an Income Mode, set
Expected Savings / Savings Target, seed default Categories), log Expenses, and
see their **Savings Gap** and **Spending Cap** update immediately — with or
without a network connection. Anonymous auth means no sign-up friction. The build
follows the 9-step order in `docs/tech-stack.md §6`, landing each layer behind a
test seam before the next is stacked on it.

## User Stories

1. As a new user, I want to open the app without creating an account, so that I can start tracking immediately.
2. As a new user, I want to be signed in anonymously on first launch, so that my data syncs later without me entering credentials.
3. As a new user, I want a short onboarding that asks my Income Mode, so that the app calculates my Savings Gap the way that fits how I earn.
4. As a Salary-mode user, I want to enter a single fixed monthly income, so that my Actual Savings reflects salary minus expenses.
5. As a Mixed-mode user, I want to log salary and freelance income separately, so that irregular income is counted in my Actual Savings.
6. As a Target-mode user, I want to set a Savings Target without logging income, so that my gap is measured as target minus expenses.
7. As a user in Salary or Mixed mode, I want to commit to an Expected Savings figure during onboarding, so that the Savings Gap has a baseline to measure against.
8. As a new user, I want the 7 default Categories seeded for me, so that I can log expenses without first setting categories up.
9. As a user, I want to log an Expense with an amount, Category, Payment Method, and date, so that my spending is recorded.
10. As a user, I want the add-expense form to open as a bottom sheet I can drag to dismiss, so that logging feels fast and native.
11. As a user, I want the Save button disabled until the amount is greater than zero and a category is chosen, so that I can't record an invalid expense.
12. As a user, I want to pick a Payment Method (Cash, GCash, Card, Others, or custom) on an expense, so that I can remember how I paid.
13. As a user, I want to pick an expense date with a native date picker, so that I can backdate entries.
14. As a user, I want dates shown relatively ("Today", "Yesterday"), so that recent expenses are easy to scan.
15. As a user, I want amounts formatted as pesos (`₱`, en-PH, tabular figures), so that the numbers read correctly for my locale.
16. As a user, I want to see my Savings Gap on the Home screen, so that I know at a glance whether I'm on track or at risk.
17. As a user, I want a positive Savings Gap to mean I'm saving more than expected (on track), so that the sign matches natural language (per ADR 0001).
18. As a user, I want to see my Spending Cap and remaining spendable amount on Home, so that I know how much I can still spend across budgeted categories.
19. As a user, I want per-category spending measured against each category's limit, so that I can see which budgets I'm close to exceeding.
20. As a user, I want to set an optional monthly limit on a Category, so that it contributes to my Spending Cap.
21. As a user, I want to opt a Category into Budget Carryover, so that unused budget rolls into the next Budget Cycle.
22. As a user, I want my Budget Cycle to start on a configurable day of month (default the 1st), so that it matches my payday.
23. As a user, I want to browse my past expenses in a History view, so that I can review where my money went.
24. As a user, I want my expenses grouped and sorted by date (most recent first), so that history is readable.
25. As a user, I want everything I do to work offline, so that I can log expenses without a connection.
26. As a user, I want my offline writes queued in a Sync Queue and replicated to Supabase when I'm online, so that my data is backed up without me thinking about it.
27. As a user, I want the queue to persist across app restarts, so that pending writes aren't lost if I close the app.
28. As a user, I want my local client IDs correctly mapped to my authenticated account, so that synced records belong to me.
29. As a user, I want to soft-delete an expense into Recently Deleted, so that I can restore it within 30 days if I deleted it by mistake.
30. As a user, I want to restore a Recently Deleted expense from Settings, so that an accidental delete is recoverable.
31. As a user, I want bill reminders and budget alerts pushed to my device, so that I act before a due date or an overspend.
32. As a user, I want my Expo push token registered and stored, so that the backend edge functions can notify me.
33. As a user, I want screens to push in with the native iOS slide and tabs at the bottom with a center add button, so that the app feels like the prototype.
34. As a user, I want the app to look like the finished prototype (tokens, spacing, springs), so that it feels polished and intentional.
35. As a maintainer, I want the core Savings Gap and Spending Cap math unit-tested, so that the product's central calculations can't silently regress.
36. As a maintainer, I want the SQLite query layer tested against a real temp database, so that reads/writes and the Sync Queue behave correctly.
37. As a maintainer, I want the onboarding and add-expense flows covered by Maestro E2E, so that the critical paths are protected in CI.
38. As a maintainer, I want the E2E flows to run as a PR gate on EAS, so that regressions are caught before merge.
39. As a maintainer, I want the app to build for iOS via EAS from Windows, so that I can ship without a Mac.
40. As a maintainer, I want `app.json` configured for both iOS and Android from day one, so that Android is a later build-target flip, not a rewrite.

## Implementation Decisions

- **Framework:** managed Expo SDK 58 (RN 0.88, React 19), scaffolded with `npx create-expo-app@latest` (expo-router + TypeScript template). No bare workflow, no custom dev client. `app.json` configured for iOS **and** Android, iOS-first.
- **Package policy:** install all Expo-managed packages with `npx expo install` so SDK versions stay aligned. Do not hand-pin Expo-managed packages. `.npmrc` keeps `legacy-peer-deps=true`.
- **Navigation:** Expo Router (file-based). Tabs in `app/(tabs)/`; add-expense as a modal/sheet route. Four tabs (Home, History, Budgets, Settings) plus a center add FAB.
- **Local DB is the source of truth:** `expo-sqlite`. A thin query layer plus a migrations runner driven by plain SQL files that mirror `supabase/migrations`. No ORM for 6 tables. Text primary keys (client-generated IDs). Dates stored as `YYYY-MM-DD` text (string compares — do not convert to a date type).
- **Sync Queue:** a local SQLite table of pending create/update/delete operations, persisted across restarts, drained to Supabase on auth and on foreground. The sync layer is aware of two ID spaces: client `generateId()` text IDs and the Supabase `auth.uid()` UUID used for `user_id` foreign keys.
- **Default categories:** the 7 defaults are seeded **locally** in SQLite on first launch, not relied upon as shared `user_id IS NULL` rows.
- **Auth:** `@supabase/supabase-js` v2, anonymous-only (`signInAnonymously()` on first launch) per ADR 0002. No email/password UI. Session persisted via AsyncStorage with `detectSessionInUrl: false`. Anonymous sessions are `authenticated` JWTs — verify the existing `TO authenticated` RLS policies cover them.
- **Add-expense sheet:** `@gorhom/bottom-sheet` with Reanimated + Gesture Handler — do not hand-port the prototype's drag/velocity/rubber-band. Reanimated also drives the prototype's easing/spring tokens.
- **Domain math:** pure TypeScript utilities for Savings Gap, Spending Cap, budgeted-spent — no library. Savings Gap = `Actual Savings − Expected Savings`; positive = on track (ADR 0001). Target Mode: Expected Savings = 0, Actual Savings = `Savings Target − Total Expenses`.
- **Money/numbers:** no library. `Intl.NumberFormat('en-PH', …)` on Hermes. `amount` stored as numeric, handled as a JS number (whole-peso scale). *Shortcut: JS number for money is fine at PHP whole-peso scale; revisit for multi-currency or cents precision.*
- **Dates:** `@react-native-community/datetimepicker` for entry; relative-date formatting (`fmtDate`) kept as a ~10-line util. No date-fns yet.
- **Notifications:** `expo-notifications` to register and write `profiles.expo_push_token`, read by the `bill-reminders` / `budget-alerts` edge functions. **Schema gap:** `profiles` has no `expo_push_token` column — add a migration (`ALTER TABLE public.profiles ADD COLUMN expo_push_token text;`) before wiring. Run Supabase security + performance advisors after applying.
- **Icons:** `@expo/vector-icons` (Feather) for tab icons; category icons stay as emoji strings from the seed data.
- **Design system:** no UI kit. Build the ~12 components from the prototype CSS directly; design tokens → a theme file. Per project convention, styles live in co-located `<file>.styles.ts` (never inline `StyleSheet.create` in the `.tsx`).
- **State:** React state + a small context (optionally one-file Zustand). No React Query; local/server data is driven by SQLite reads.
- **Release:** EAS Build (iOS compiled in Expo's hosted macOS cloud), `eas.json` with `development`/`preview`/`production`/`e2e-test` profiles, EAS Submit, EAS Update gated by the runtime-version/fingerprint rule.

## Testing Decisions

- **Good tests here exercise external behavior, not internals.** The domain-math tests assert that given inputs produce the documented Savings Gap / Spending Cap outputs across all three Income Modes and edge cases (zero income, negative gap, no budgeted categories) — they do not assert how the function is structured. The query-layer tests assert observable read/write/soft-delete/Sync-Queue behavior against a real temporary SQLite database, not the SQL text.
- **Seams (ordered by altitude):**
  - *Pure-function seam* — the domain math (`computeGap`, `spendingCap`, `budgetedSpent`). Highest, cheapest seam; unit tests, no I/O. Built and tested first.
  - *Query-layer seam* — the SQLite query functions and migrations runner, tested against a temp DB.
  - *E2E seam* — Maestro flows (onboarding, add-expense) at the top of the stack, re-created from scratch; wired as an EAS Workflows PR gate.
- **Prior art:** none in-repo after the wipe, but the pre-wipe build had Maestro flows with 3/4 passing — reuse those findings (see memory `project-beta-testing`). Keep Maestro flows under `.maestro/` and the CI job under `.eas/workflows/`.
- **Local vs CI:** Maestro iterates locally against **Android** (Windows-native CLI, Java 17); the iPhone-first flows are exercised only in **CI on EAS macOS runners** — accept this gap for MVP.

## Out of Scope

- **PIN / biometric Lock** (Glossary: Lock Timeout) — deferred; `expo-local-authentication` + `expo-secure-store` not installed yet (marked SOON in the design).
- **Recurring Rules UI** (Remind Me / Auto-Log screens) — the table and edge functions exist, but the screen is SOON. Per ADR 0003, auto-log fires on first app open on/after the due date, not via background fetch — relevant when the UI is built.
- **Email/password or social auth** — anonymous-only for MVP (ADR 0002).
- **i18n library** — single locale (en-PH); Taglish is copy, not localization.
- **ORM, form library, money library, React Query, UI kit** — explicitly skipped (`docs/tech-stack.md §4`); revisit only if the corresponding concern actually grows.
- **Local iOS E2E** — requires a macOS Simulator; not available on the Windows dev machine.

## Further Notes

- Build order and per-step detail live in the numbered sub-issues under `issues/`, mirroring `docs/tech-stack.md §6`. Each sub-issue records its own `Blocked by:` dependencies.
- Primary sources for every package choice are in `docs/tech-stack.md §Sources` and `docs/e2e-and-release.md`.
- Honour the Glossary vocabulary in all code and copy (Expense not transaction, Savings Gap not gap amount, etc.) and the three ADRs in the areas they touch.

## Comments
