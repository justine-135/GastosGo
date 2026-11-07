---
name: project-beta-testing
description: GastosGo beta testing status — Maestro E2E results, known gaps, and audit findings
metadata:
  type: project
---

## Maestro E2E status (batch 5, 2026-11-06)

- 01-smoke: PASS
- 02-onboarding: FAIL (still failing — was failing in batch 4 too)
- 03-add-expense: PASS (payment method field below fold, not tested — TASK-BE-02 fixing)
- 04-navigation: assertions updated (batch 5) to use content-level checks instead of tab-bar labels

## Wave 0 finding (TASK-FE-01)
Tab nav screens all export unique components; `_layout.tsx` is structurally correct. The reported "all tabs show Dashboard" bug was a **false negative from broken Maestro assertions** — the assertions checked tab bar labels (always visible) rather than screen content. Fixed in TASK-FE-02 by updating `e2e/04-navigation.yaml` to use `assertNotVisible: "Recent Transactions"` and unique screen content.

## Wave 1 fixes applied (batch 5)
- `app/_layout.tsx`: auth overlay (`isAuthChecking` state, early `return null`) + LogBox suppression (`EXPO_E2E=true` guard) — DONE
- `e2e/04-navigation.yaml`: content-level assertions — DONE

## PRD feature audit (TASK-BE-01)
| Area | Result |
|---|---|
| Budgets (80%/100% thresholds) | PASS |
| Insights (category breakdown, userId) | PASS |
| Push notifications | FAIL — two gaps: (1) push token never upserted to Supabase profiles table (line ~51-52 of lib/notifications.ts is commented out); (2) budget-alerts Edge Function is HTTP-triggered but never called client-side after expense insert |
| Recurring rules (local-date advance) | PASS |
| PIN lockout (5 attempts, 30s) | PASS |
| Sync store + Settings screen | PASS |

## Push notification gaps to fix (future task)
1. Uncomment/implement token upsert to `profiles` in `lib/notifications.ts`
2. Call the `budget-alerts` Edge Function after each expense is saved (likely in `db/queries/insertExpense` or the `useInsertExpense` hook)

**Why:** Edge Function is HTTP-triggered, not a cron — nothing calls it. Token upsert is commented out so the server never has the device token to send to.
