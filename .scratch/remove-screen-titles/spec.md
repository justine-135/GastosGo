Status: ready-for-agent

# Spec: Remove Screen Titles from Tab Screens

## Problem Statement

Each of the main tab screens (Budgets, History, Settings) renders a large title text in the top-left corner of the screen. This takes up vertical space and creates visual redundancy — the bottom tab bar already identifies where the user is. The titles add noise without adding orientation value on the tab screens.

## Solution

Remove the large top-left title text from the three tab screens that have one (Budgets, History, Settings). The vertical space the title occupied collapses — nothing replaces it. Sub-screens accessed via the Settings screen (Budget Cycle, Income Mode, Recently Deleted) and other screens that use NavBar titles retain their titles, as those screens have no other orientation cue.

## User Stories

1. As a user on the Budgets screen, I do not see a large title in the top-left corner, so that the content area is less cluttered.
2. As a user on the History screen, I do not see a large title in the top-left corner, so that more of my expense history is immediately visible.
3. As a user on the Settings screen, I do not see a large title in the top-left corner, so that the settings list starts higher on the screen.
4. As a user navigating to a sub-screen (e.g. Budget Cycle, Income Mode, Recently Deleted), I still see the screen name in the NavBar, so that I know where I am.
5. As a user on the Home screen, I am unaffected, as it has no top-left title already.
6. As a user on any screen reached via a NavBar (category picker, budget edit), I still see its NavBar title, so that I retain orientation context.

## Implementation Decisions

- Remove the `<Text style={styles.largeTitle}>Budgets</Text>` element from the Budgets screen.
- Remove the `<Text style={styles.largeTitle}>History</Text>` element from the History screen.
- Remove the `<Text style={styles.pageTitle}>Settings</Text>` element from the Settings screen.
- Remove any wrapper `<View>` or spacing that existed solely to contain or separate the title, so the vertical space collapses cleanly.
- The `NavBar` component is not changed. All sub-screens (budget-cycle, income-mode, recently-deleted, budget-edit, category-picker) keep their `title` prop.
- The Home screen is not touched — it has no title.
- Onboarding screens are out of scope.

## Testing Decisions

A good test here is a visual/manual check: launch the app, navigate to each of the three affected tab screens, and confirm no title text appears at the top. No automated unit test is warranted for a pure element removal with no logic change.

If snapshot tests exist for these screens, update them to reflect the removed element. Prior art: check `.scratch/design-system/` issues for any existing screen-level snapshot or Maestro flow that asserts on screen titles.

## Out of Scope

- Changing, restyling, or repositioning titles on any sub-screen.
- Removing or modifying the bottom tab bar labels.
- Onboarding screens.
- The Add Expense sheet header.
- Any animation or transition changes.

## Further Notes

The Home screen already ships without a top-left title, so the end state is consistent: no tab screen will have a large top-left title.
