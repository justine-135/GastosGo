# GastosGo — Frontend Code Review

**Reviewer:** Senior RN/React reviewer (read-only)
**Date:** 2026-11-09
**Scope:** Layout/root, tab screens, onboarding, modals, shared components, savings feature, React Query hooks, Zustand stores.

## Summary Table

| File group | Severity | Count | Top Issue |
|---|---|---|---|
| `hooks/*` | Medium | 7 | `LOCAL_USER_ID` hardcoded into every query key; mutation invalidation is inconsistent (broad vs narrow) across hooks |
| `stores/*` | Low | 3 | `uiStore`/`syncStore` not persisted; selectors return whole store causing wide re-renders |
| `app/(tabs)/*` | Medium | 9 | `budgets.tsx` `renderItem` + `expenses.tsx` `renderItem` are inline/unmemoized; Insights imports a stubbed `victory-native` |
| `app/onboarding/*` | Medium | 8 | Step count duplicated across 6 files; PIN hashed without salt (shared with lock); `index.tsx` is "Step 1" but navigates to income without rendering as step 0 of flow consistently |
| `app/modals/*` | Medium | 6 | Duplicated inline "local ISO date" IIFE; props `interface` declared but unused; broad `['expenses']` invalidation |
| `components/*` | Medium | 6 | `CategoryChip` + `BudgetProgressBar` not memoized; hardcoded hex colors everywhere (no token layer) |
| `app/_layout.tsx`, `lock.tsx`, `settings.tsx` | High | 8 | No error boundary; silent catches on migrations/push token; PIN SHA-256 without salt; `handleBackup` recursive retry |
| **All 20 `.tsx` files** | Medium | 1 | `StyleSheet.create` inlined in component files — convention requires a co-located `<file>.styles.ts` file |

## Overall Health Assessment

This is a **well-built, consistent codebase for its stage** — "Good, with targeted improvements needed." The engineering fundamentals are strong: React Query is used correctly (stable query-key factories, `staleTime`, `mutateAsync` with try/catch at call sites), accessibility is genuinely good (labels, roles, states, 44px hit targets appear throughout), loading/empty states are handled everywhere, and list components already use `keyExtractor` with stable IDs. The team clearly cares about UX polish and a11y, which is rarer than clean hooks.

The recurring weaknesses are **three themes**, not scattered one-offs:

1. **No design-token layer.** Every color (`#F4A261`, `#2D3047`, `#E5D5C0`, `#E76F51`, ...), spacing, and radius is a raw literal duplicated across ~20 files. This is the single highest-leverage refactor: a theme crash or rebrand touches every file. The brand orange `#F4A261` alone appears dozens of times.
2. **Inconsistent cache-invalidation breadth.** Some mutations invalidate narrowly by month/year key; others blow away all `['expenses']` / `['budgets']`. The cross-hook cascade (expense writes invalidate budgets + savings, but budget writes do NOT invalidate expenses) is asymmetric and will cause subtle stale-data bugs as the app grows.
3. **No top-level error boundary + silent failure swallowing.** `runMigrations().catch(console.error)` means a failed schema migration shows a working-looking but broken app with no user signal. There is no `ErrorBoundary` anywhere in the tree.

Plus two correctness items worth flagging now: **PINs are hashed with bare SHA-256 (no salt/iteration)** — a 6-digit PIN has only 10^6 preimages, trivially brute-forced from the stored hash; and **`settings.tsx handleBackup` passes itself as the Alert retry handler**, creating an unbounded recursion path on repeated failure.

None of these block a beta. The token extraction and the error boundary are the two I'd schedule first.

See per-area docs: [components](components.md) · [hooks](hooks.md) · [stores](stores.md) · [screens-tabs](screens-tabs.md) · [screens-onboarding](screens-onboarding.md) · [screens-modals](screens-modals.md) · [layout](layout.md)
