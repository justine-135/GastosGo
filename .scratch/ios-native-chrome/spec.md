Status: resolved

# Spec: iOS Native Chrome

## Problem Statement

The app renders every piece of navigation chrome (headers, back buttons, tab bar center slot, settings rows, switches, action sheets, bottom sheets) with fully custom components. This makes the app feel like a web app wearing a native skin rather than a true iOS app. The one native header that does appear — the "< (tabs)" back button on the Reset Cycle screen — is an unintentional bug (missing Stack.Screen declaration), not a design choice.

Users expect iOS-native navigation gestures (back swipe), blur headers, grouped settings lists, system switches, and native sheet presentations. The current custom NavBar blocks all of these.

## Solution

Adopt an "iOS native chrome, custom content" strategy: replace the custom navigation frame (NavBar, FAB, bottom sheets) with platform-native equivalents while keeping branded colors, fonts, and content areas inside each screen. The "Add Expense" action moves from the center-of-tab-bar FAB to a native "+" button in the top-right of every tab screen's header.

## User Stories

1. As a user on any screen with a back button, I can swipe from the left edge to go back, so that navigation feels native to iOS.
2. As a user on any sub-screen, I see a native iOS back button (chevron + previous screen title) in the top-left, so that navigation is consistent with other iOS apps.
3. As a user on any tab screen, I see a "+" button in the top-right of the header, so that I can log an expense from anywhere.
4. As a user pressing the "+" header button, the Add Expense sheet opens, so that the core action remains one tap away.
5. As a user on the tab bar, I see four tabs (Home, History, Budgets, Settings) with no center FAB gap, so that the tab bar looks standard.
6. As a user on the Settings screen, I see grouped list sections with rounded corners and system separators, so that settings look like a native iOS app.
7. As a user long-pressing or tapping an action with multiple choices (e.g. an expense in History), I see a native iOS action sheet (not a custom modal), so that multi-choice interactions feel native.
8. As a user toggling a boolean setting, I see a native iOS Switch control, so that toggles look and behave like system settings.
9. As a user selecting between mutually exclusive options (e.g. payment method, Income Mode), I see a native iOS segmented control, so that pickers feel native.
10. As a user opening the Add Expense or Recurring Rule form, it presents as a native iOS form sheet (drag to dismiss, system dimming), so that modal interactions feel native.
11. As a user performing a significant action (tapping "+", switching tabs, confirming a destructive action), I feel haptic feedback, so that interactions feel tactile and native.
12. As a user on any screen, I see the app's branded fonts and colors in the content area, so that the app retains its identity despite native chrome.
13. As a user on the Home screen, I see a blurred translucent header, so that the header matches iOS conventions.
14. As a user on a sub-screen (Budget Edit, Category Picker, Budget Cycle, etc.), the header shows the screen title with native styling, so that orientation is clear.
15. As a user on any tab screen, I do not see any remnant of the old FAB or center tab placeholder, so that the transition is clean.
16. As a user in onboarding, I am unaffected by these changes, so that onboarding remains stable.

## Implementation Decisions

### Native Stack headers

- Remove the custom `NavBar` component and its styles file entirely.
- Set `headerShown: true` on all non-onboarding Stack.Screen entries in the root layout.
- Configure shared header options: `headerBlurEffect: 'systemMaterial'`, `headerTransparent: true`, `headerLargeTitle: false`.
- Each sub-screen that previously passed `title` and `onBack` to NavBar now sets its title via Stack.Screen `options.title`. Back navigation is handled automatically by the native Stack.
- Screens that had a `rightLabel`/`onRight` prop on NavBar (budget-edit, recurring-rules) set `headerRight` in their Stack.Screen options.
- Register the missing `settings/reset-cycle` Stack.Screen entry in the root layout.

### "+" header button on every tab

- Each tab screen in `app/(tabs)/_layout.tsx` gets `headerRight` returning a Pressable with a Feather "plus" icon that calls `presentAddExpenseSheet`.
- The button uses the system tint color and standard iOS header button sizing.
- Haptic feedback (light impact) fires on press.

### Remove FAB and add placeholder tab

- Delete the `FabButton` component from `TabBar.tsx`.
- Remove the `fabSlot` and center-gap layout logic from TabBar — render four tabs in a row.
- Delete `app/(tabs)/add.tsx`.
- Remove the `add` tab from the Tabs.Screen list in `app/(tabs)/_layout.tsx`.

### iOS grouped list for Settings

- Restyle the Settings screen's `ListRow` to match iOS inset grouped table view: rounded section corners, system background color, hairline separators, chevron disclosure indicator.
- Group rows into sections (each section gets a rounded container with system grouped background).

### Native action sheets

- Install `@expo/react-native-action-sheet`.
- Wrap the root layout with `ActionSheetProvider`.
- Replace any multi-choice custom modals or multi-button alerts with `showActionSheetWithOptions`.

### Native Switch and SegmentedControl

- Install `@react-native-segmented-control/segmented-control`.
- Replace custom toggle components with the native `Switch` from react-native.
- Replace custom pill/segment selectors (payment method, Income Mode picker) with the native `SegmentedControl`.

### Native formSheet for bottom sheets

- Migrate `AddExpenseSheet` and `RecurringRuleSheet` from `@gorhom/bottom-sheet` to expo-router `presentation: 'formSheet'` routes.
- These become standalone screen files rendered as native iOS form sheets with drag-to-dismiss.
- Remove the `BottomSheetModalProvider` wrapper from the root layout if no other consumers remain.
- Remove the `registerAddExpenseSheet` / `presentAddExpenseSheet` callback pattern — navigation replaces it with `router.push`.

### Haptic feedback

- Install `expo-haptics`.
- Add light impact on: tab press, "+" header button press.
- Add medium impact on: destructive action confirmation.
- Add selection feedback on: segmented control change, switch toggle.

## Testing Decisions

### Manual testing

A manual test plan covering:
- Back swipe gesture works on every sub-screen.
- "+" button visible and functional on all four tab screens.
- Tab bar shows four tabs, no FAB gap.
- Settings rows render with grouped iOS style.
- Action sheets appear for multi-choice interactions.
- Native switches and segmented controls render and function.
- Add Expense and Recurring Rule forms present as native form sheets with drag-to-dismiss.
- Haptic feedback fires on the specified interactions.
- Onboarding is unaffected.

### Component tests

- Good tests verify external behavior (what the user sees and can interact with), not implementation details (which component library renders it).
- Prior art: existing Jest tests in `__tests__/` test utilities and db logic. Component tests are new to this codebase.
- Use `@testing-library/react-native` for component tests.
- Test the following modules:
  - **TabBar**: renders four tabs (not five), no FAB, pressing a tab calls the navigation callback.
  - **Settings screen**: renders grouped sections with the expected rows, pressing a row navigates to the correct route.
  - **Header "+" button**: the headerRight component calls `presentAddExpenseSheet` (or `router.push` post-migration) on press.
  - **Action sheet integration**: destructive actions trigger the action sheet provider (mock the provider, assert it was called with correct options).

## Out of Scope

- Onboarding screens — retain their current custom navigation and styling.
- SF Symbols / icon replacement — keep Feather icons throughout.
- Android-specific styling — this is iOS-first; Android can follow later.
- Custom tab bar visual redesign — the tab bar keeps its current custom look minus the FAB.
- Charts, cards, or content-area component restyling — only chrome and system controls change.

## Further Notes

- The `@gorhom/bottom-sheet` dependency and `BottomSheetModalProvider` can be fully removed if no other bottom sheets remain after the AddExpenseSheet and RecurringRuleSheet migration.
- The `addExpenseSheet` callback registry (`registerAddExpenseSheet`, `presentAddExpenseSheet`, `setCallback`, `setOnExpenseSaved`, `notifyExpenseSaved`) in `src/lib/addExpenseSheet.ts` can be deleted once the sheet becomes a route — navigation replaces the callback pattern.
- Three new dependencies are needed: `expo-haptics`, `@react-native-segmented-control/segmented-control`, `@expo/react-native-action-sheet`.
