# 05: Native formSheet for bottom sheets

**What to build:** AddExpenseSheet and RecurringRuleSheet present as native iOS form sheets with drag-to-dismiss and system dimming, using expo-router `presentation: 'formSheet'` routes. The `@gorhom/bottom-sheet` callback registry pattern is replaced by navigation.

**Blocked by:** 01 (native Stack headers must be in place to add formSheet routes)

**Status:** ready-for-agent

- [ ] AddExpenseSheet is a standalone screen route with `presentation: 'formSheet'`
- [ ] RecurringRuleSheet is a standalone screen route with `presentation: 'formSheet'`
- [ ] Both sheets support native iOS drag-to-dismiss
- [ ] The callback registry (`registerAddExpenseSheet`, `presentAddExpenseSheet`, `setCallback`, `setOnExpenseSaved`, `notifyExpenseSaved`) is replaced by `router.push` navigation
- [ ] `BottomSheetModalProvider` is removed from the root layout if no other consumers remain
- [ ] `@gorhom/bottom-sheet` dependency is removed if no other consumers remain
