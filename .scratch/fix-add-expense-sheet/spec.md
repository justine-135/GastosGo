Status: ready-for-agent

# Fix: Add Expense Sheet — Close & Category Picker

## Problem Statement

The Add Expense sheet has two broken interactions:

1. The sheet cannot be closed. The X button calls `router.back()` directly, bypassing the sheet's dismiss animation and causing navigation issues. There is also no way to close the sheet by tapping the drag handle pill at the top.
2. Tapping "Select category" does nothing — no animation, no feedback. The category picker never opens.

## Solution

Remove the X close button entirely. Close the sheet via: backdrop tap (already wired), swipe-down gesture (already wired via `enablePanDownToClose`), and tapping the drag handle pill at the top.

Fix the category picker by replacing the `BottomSheetFlatList` (which mounts off-screen and steals gesture events from the form) with a plain `ScrollView`, eliminating the gesture conflict that makes the category row unresponsive.

## User Stories

1. As a user, I want to close the Add Expense sheet by tapping the backdrop, so that I can dismiss it quickly without reaching for a button.
2. As a user, I want to close the Add Expense sheet by swiping it down, so that it feels native and gesture-driven.
3. As a user, I want to close the Add Expense sheet by tapping the handle pill at the top, so that I have an obvious tap target to dismiss without swiping.
4. As a user, I want the sheet to not have an X close button, so that the header stays clean and uncluttered.
5. As a user, I want to tap "Select category" and have the category picker slide in, so that I can assign a category to my expense.
6. As a user, I want to tap the back arrow in the category picker to return to the form, so that I can change my mind without losing my other inputs.
7. As a user, I want the category list to be scrollable if it overflows the sheet, so that all categories are reachable.
8. As a user, I want selecting a category to slide me back to the form with the category name shown, so that I can confirm my selection at a glance.
9. As a user, I want tapping the backdrop while the category picker is open to return me to the form (not close the sheet entirely), so that I don't accidentally lose my expense entry.

## Implementation Decisions

- Remove the X `Pressable` and `closeButton` from the form header. The header retains only the title.
- Wrap the drag handle `View` in a `Pressable` with `onPress={() => sheetRef.current?.dismiss()}` for the form page handle. The category picker handle wraps with `onPress={closeToForm}` instead.
- Replace `BottomSheetFlatList` (and its `ItemSeparatorComponent`) with a plain `ScrollView` from `react-native`. Categories are mapped to `Pressable` rows with inline separators between them. This eliminates the gesture handler conflict that caused the category row to be unresponsive.
- Add `flex: 1` to the `slideViewport` style so `BottomSheetView` fills the sheet height properly.
- The slide animation, `SheetView` state, and `closeToForm` / `openCategoryPicker` logic remain unchanged.
- The backdrop behavior (`view === 'category-picker'` → `closeToForm`, otherwise → `dismiss`) remains unchanged.

## Testing Decisions

- Good tests verify observable behavior: sheet dismisses, category picker opens and closes, category selection populates the field. They do not test animation values or internal state.
- No automated test seam exists for bottom sheet interactions in this repo. Manual verification on a real iOS device is the primary test method for this fix.
- Checklist for manual verification:
  - Swipe down on the form → sheet closes, navigates back
  - Tap backdrop on the form → sheet closes, navigates back
  - Tap handle pill on the form → sheet closes, navigates back
  - Tap "Select category" → category list slides in, row shows press feedback
  - Tap a category → slides back to form, category name shown in field
  - Tap back arrow in category picker → slides back to form
  - Tap backdrop while category picker is open → returns to form, does not close sheet

## Out of Scope

- Redesigning the category picker UI (icons, colors, layout).
- Adding a search/filter to the category picker.
- Animating the handle pill tap (e.g. scale feedback).
- Handle tap-to-dismiss for the category picker page (back arrow already serves this).

## Further Notes

The gesture conflict root cause: `BottomSheetFlatList` registers a gesture handler with gorhom's gesture system when mounted. Because the category picker page is mounted but off-screen (translated via `Animated.Value`), its gesture handler is still active and intercepts touches intended for the form page — specifically the category `Pressable`. Replacing with a plain `ScrollView` removes the gorhom gesture handler entirely from that subtree.

If the category list grows long enough to require scrolling, `ScrollView` inside `BottomSheetView` should work on iOS. If scroll conflicts appear in future, migrate to `BottomSheetScrollView` from gorhom and conditionally render the category page only when `view === 'category-picker'` to avoid re-introducing the gesture conflict.
