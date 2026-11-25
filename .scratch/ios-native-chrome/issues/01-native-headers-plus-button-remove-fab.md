# 01: Native Stack headers + "+" header button + remove FAB

**What to build:** Every screen uses the native iOS header with blur effect and back-swipe gesture. The "+" button appears in the top-right of every tab screen's header and opens the Add Expense flow. The floating action button, the `add` placeholder tab, and the custom NavBar component are all deleted. The tab bar shows four tabs in a row with no center gap.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] All non-onboarding screens render the native Stack header with `headerBlurEffect: 'systemMaterial'` and `headerTransparent: true`
- [ ] Custom NavBar component and its styles file are deleted; no screen imports NavBar
- [ ] Screens that had `rightLabel`/`onRight` on NavBar (budget-edit, recurring-rules) set `headerRight` in their Stack.Screen options
- [ ] The missing `settings/reset-cycle` Stack.Screen is registered in the root layout
- [ ] Every tab screen (Home, History, Budgets, Settings) shows a "+" button in the header top-right that opens the Add Expense sheet
- [ ] The FAB component is removed from TabBar; the tab bar renders four tabs with no center slot
- [ ] `app/(tabs)/add.tsx` is deleted and removed from the Tabs.Screen list
- [ ] Back-swipe gesture works on every sub-screen
- [ ] Onboarding screens are unaffected (retain `headerShown: false`)
