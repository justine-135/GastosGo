---
name: project-conventions
description: GastosGo RN/Expo/TS stack, state/data conventions, and the recurring anti-patterns to flag in reviews
metadata:
  type: project
---

GastosGo is a single-user (for now) Filipino expense tracker. Expo Router v4 + TypeScript, React Query for server/DB state, Zustand for UI/theme/sync state, Gluestack UI, Drizzle/SQLite local DB with a Supabase cloud backup/sync layer, victory-native + Reanimated for charts.

**Established good patterns (preserve these):**
- React Query key factories per hook (`expenseKeys`, `budgetKeys`, etc.), typed `as const`, co-located in `hooks/`.
- Strong accessibility is the norm: `accessibilityRole` + `accessibilityLabel` + `accessibilityState` on interactive elements, `minHeight: 44/56` touch targets, `hitSlop` on small arrows. Hold code to this bar.
- Mutations use `mutateAsync` wrapped in try/catch at the call site with an `Alert` fallback.
- `utils/format.ts` is the home for formatting helpers (`formatPeso`, `formatDate`, etc.).

**Recurring anti-patterns to flag (seen across many files):**
- **No design-token layer.** Raw hex literals duplicated everywhere — brand orange `#F4A261`, ink `#2D3047`, border `#E5D5C0`, danger `#E76F51`, warn `#E9C46A`, ok `#81B29A`, muted `#9CA3AF`, bg `#FFF8F0`. Highest-leverage refactor. Recommend `theme/colors|spacing|radius`.
- **Duplicated "local ISO date" IIFE** `(() => { const n=new Date(); return new Date(n.getTime()-n.getTimezoneOffset()*60000).toISOString().split('T')[0]; })()` in add-expense, add-recurring, useRecurring (variant), and date-picker handlers. Should be `todayLocalISO()`/`toLocalISO()` in utils/format.
- **Inconsistent React Query invalidation breadth** — some mutations invalidate narrow month keys, others broad `['expenses']`/`['budgets']`; cross-domain cascade is asymmetric (expense writes touch budgets+savings, budget writes touch neither). 
- **`LOCAL_USER_ID` (lib/constants.ts) hardcoded** into every query key via `const USER_ID = LOCAL_USER_ID` alias in 4 hook files + screens. Must become a param when auth lands. The alias is redundant indirection.
- **Unmemoized list rows / inline renderItem** in FlatList/SectionList (budgets.tsx, expenses.tsx) and unmemoized `CategoryChip`/`BudgetProgressBar`.
- **Step indicator copy-pasted** into all 6 onboarding screens — should be a `<StepIndicator>` component.
- **Redundant per-hook `staleTime: 30_000`** duplicating the QueryClient default in app/_layout.tsx.

**Security notes:** PINs are hashed with bare SHA-256 (no salt) in both lock.tsx and onboarding/pin-setup.tsx — brute-forceable (10^6 space). Lockout counters live in unencrypted AsyncStorage, not SecureStore. There are THREE separate PIN-entry implementations (lock.tsx, pin-setup.tsx, and the shared PinPad component) that should be consolidated.

**Known fragile spots:** No top-level ErrorBoundary. `runMigrations().catch(console.error)` silently swallows migration failures in app/_layout.tsx. victory-native had a `shortcut:` stub comment in insights.tsx (verify it's actually installed). settings.tsx `handleBackup` passes itself as the Alert retry handler (recursive retry risk).

See full review in `docs/code-review/fe/`.
