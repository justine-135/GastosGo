# 07: Component tests

**What to build:** Component tests using `@testing-library/react-native` verifying the final state of the UI after all native chrome changes land. Tests verify external behavior (what the user sees and interacts with), not implementation details.

**Blocked by:** 01, 02, 05 (tests verify the final form of TabBar, Settings rows, and header button)

**Status:** ready-for-agent

- [ ] `@testing-library/react-native` is installed as a dev dependency
- [ ] TabBar test: renders exactly four tabs, no FAB; pressing a tab calls the navigation callback
- [ ] Settings screen test: renders grouped sections with expected rows; pressing a row navigates to the correct route
- [ ] Header "+" button test: the headerRight component triggers the Add Expense flow on press
- [ ] Action sheet integration test: destructive actions trigger the action sheet provider with correct options (mock the provider)
