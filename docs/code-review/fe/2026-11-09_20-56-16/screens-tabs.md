# Tab Screens Review

Reviewed: `app/(tabs)/_layout.tsx`, `index.tsx`, `expenses.tsx`, `budgets.tsx`, `insights.tsx`.

---

## Cross-cutting (all tab screens)
**Severity:** Medium

### Issues
- [Medium] **Style convention not followed.** All five files (`_layout`, `index`, `expenses`, `budgets`, `insights`) have `StyleSheet.create(...)` inline. Each needs a co-located `<name>.styles.ts` file (e.g. `expenses.styles.ts` next to `expenses.tsx`).

---

## _layout (`app/(tabs)/_layout.tsx`)
**Severity:** Low

### Issues
- [Low] Tab bar magic numbers: `paddingBottom: Platform.OS === 'ios' ? 20 : 8` and `height: Platform.OS === 'ios' ? 84 : 64`. Extract to a `constants.ts` (`TAB_BAR_HEIGHT`, `TAB_BAR_PADDING`) — these also interact with the `paddingBottom: 100` scroll insets in `index.tsx` and FAB `bottom: 24`, which should all be derived from shared constants so they can't drift.
- [Low] Hardcoded tint hex (`#F4A261`, `#9CA3AF`, `#FFF8F0`, `#E5D5C0`) — token note.
- [Info] Emoji tab icons via `<Text>` are fine for now but won't tint with `tabBarActiveTintColor` (opacity hack used instead). Fine for beta.

### Strengths
- `TabIcon` extracted as a small focused component; `screenOptions` centralizes styling. Clean and idiomatic expo-router tabs.

---

## index / Dashboard (`app/(tabs)/index.tsx`)
**Severity:** Medium

### Issues
- [Medium] `RefreshControl refreshing={isLoading}` where `isLoading = loadingRecent || loadingBudgets || loadingSavings || loadingBills`. On first mount all four are loading, so the pull-to-refresh spinner shows on initial load (not just on pull), and the spinner stays until the slowest query resolves. Prefer a dedicated `refreshing` state driven only by the manual `onRefresh`, decoupled from initial query loading.
- [Low] `criticalBudget` sorts a copy correctly (`?.filter(...).sort(...)`) — good, no mutation of cached data — but it's recomputed every render without `useMemo`. Cheap here; fine.
- [Low] Recent transactions render via `recentExpenses?.map(...)` inside a `ScrollView`. For a capped list of 5 this is correct (a FlatList inside a ScrollView would be worse). No change needed, but document the 5-item cap assumption.
- [Low] Raw hex throughout the large `StyleSheet`.

### Strengths
- Excellent empty/loading/loaded state handling per-card (`SkeletonLoader`), plus a dedicated first-run empty state with a CTA. The `formatPeso(savings.totalIncome - savings.totalExpenses)` "left of" line is a nice touch. `onRefresh` is correctly memoized with `[qc]`.

---

## expenses (`app/(tabs)/expenses.tsx`)
**Severity:** Medium

### Issues
- [Medium] `SectionList renderItem` is an **inline arrow** that constructs an `ExpenseRow` with fresh `onEdit`/`onDelete` closures every render. Combined with `ExpenseRow` not being memoized, every list render rebuilds all rows. Extract a stable `renderItem` via `useCallback` and wrap `ExpenseRow` in `React.memo`; pass `item` + stable handlers (handlers can take the item as an arg to stay stable).
- [Medium] The `categories` memo derives the filter-chip list by scanning `expenses` for unique `categoryId`s — but it returns whole `Expense` objects (the first occurrence) just to read `categoryId/categoryName/categoryColor`. This couples the chip list to expense row shape and silently drops categories that have no expenses this month. If that's intended (only show categories with spend), add a comment; otherwise source chips from the categories query.
- [Low] Two large `SectionList`s (expenses tab and recurring tab) share one giant component. The recurring-tab `RefreshControl refreshing={loadingRecurring}` reuses the query loading flag rather than the manual `refreshing` state used by the expenses tab — inconsistent. Consider splitting into `<ExpensesTab />` and `<RecurringTab />` sub-components; the file is ~430 lines doing two jobs.
- [Low] `RecurringRow` builds a `badge` lookup object inline every render; trivial, but could be a module constant.

### Strengths
- `keyExtractor={(item) => item.id}` with stable IDs; `stickySectionHeadersEnabled`; correct date-grouping via `useMemo` sorted descending. Delete/edit are confirmed via `Alert`. a11y labels on rows are rich and descriptive ("... Long press to delete."). Filter chips have proper selected state. Strong screen overall.

---

## budgets (`app/(tabs)/budgets.tsx`)
**Severity:** Medium

### Issues
- [Medium] `renderItem` is declared as a plain function **inside the component body** and passed to `FlatList`. It's recreated every render and closes over `editingId`/`editValue`, defeating FlatList's render memoization. Wrap in `useCallback` (deps: `editingId`, `editValue`, handlers) or hoist to a memoized row component taking props.
- [Medium] `commitEdit` fires on **both** `onSubmitEditing` and `onBlur`. `onSubmitEditing` typically also blurs, so `updateBudget.mutate` can fire twice for one edit. Guard against double-submit (e.g., clear `editingId` first — which is done — but the second `commitEdit` still runs with the same `item`; add an `if (editingId !== item.categoryId) return` guard at the top of `commitEdit`).
- [Medium] Comment at line ~35 says "Optimistic update: mutate immediately" but `useUpdateBudget` performs **no** optimistic cache write (see hooks.md). The UI blocks on refetch. Fix the comment or implement real optimism.
- [Low] `RefreshControl refreshing={isLoading}` again couples pull-refresh to initial load.
- [Low] Magic thresholds `100` / `80` for over/near repeated here and in `insights`/`BudgetProgressBar` — centralize.

### Strengths
- Inline edit UX with `autoFocus`, numeric keyboard, and validation (`isNaN`/`< 0`) is well done. Rich a11y label summarizing spend vs limit and over/near state. Correct `keyExtractor`.

---

## insights (`app/(tabs)/insights.tsx`)
**Severity:** Medium

### Issues
- [High] Line 6–7: imports `PolarChart, Pie` from `victory-native` with a `shortcut:` comment stating **victory-native is not installed / is a stub pending TASK-DB-01**. If the dependency is genuinely absent this screen crashes on mount. Verify `victory-native` + its `skia` peer are installed before this ships; if stubbed, the whole Insights tab is non-functional. This is the one potential runtime-crash in the reviewed set — confirm it.
- [Medium] `BarChartSection` hardcodes the chart height `160` in three places (`* 160`, y-axis `height: 160`) plus the `maxValue` math. Extract `CHART_HEIGHT = 160`. The bar colors `#F4A261`/`#81B29A`/`#E76F51` are duplicated between the bars and the legend — token them.
- [Low] `const USER_ID = LOCAL_USER_ID` re-aliased here too (same note as hooks). The `['multi-month-summary', USER_ID, last6]` key embeds a memoized array of objects — React Query serializes it fine, but confirm `last6` identity is stable (it is, via `useMemo(..., [])`).
- [Low] `totalSpent` and `slicesWithSpend` recomputed each render without `useMemo`; cheap, fine.
- [Low] `onRefresh={() => { refetch(); refetchMonths(); }}` fires both but doesn't await — the spinner (`refreshing={isLoading}`) is tied to query loading, so acceptable, but the two refetches aren't coordinated.

### Strengths
- `getMultiMonthSummary` as a single query replacing 6 round-trips (noted `BE-04`) is exactly right. The pie `onPress` worklet correctly wraps the JS callback with `runOnJS` — this is the Reanimated-safe pattern and matches the earlier crash fix in git history. Thorough null-guarding for uncategorised expenses (`|| 'Uncategorised'`, `|| '#9CA3AF'`). Good empty/all-zero handling in the bar chart.
