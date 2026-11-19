Status: ready-for-agent

# Add Expense Sheet — UX Rework

## Problem Statement

Adding an expense opens a double overlay: the route is registered as a Stack modal (`presentation: 'modal'`) AND the screen component wraps its content in a `BottomSheetModal` from `@gorhom/bottom-sheet`. Both animate upward simultaneously, creating a jarring duplicated-sheet effect. Additionally, tapping "Select category" navigates to a separate route via `router.push`, which abandons the sheet context and relies on a module-level mutable bridge callback (`categoryPickerBridge`) to pass the picked value back — a fragile pattern that breaks the feeling of a single cohesive flow.

## Solution

The add-expense flow becomes a single gorhom `BottomSheetModal` that owns the whole interaction. The Stack route registration loses its `presentation: 'modal'` so the Stack does not add a second overlay. The category picker moves inside the sheet as an internal view swap — no route push, no bridge callback. The sheet handles its own dismiss (swipe down or tap backdrop) and shifts up with the keyboard.

## User Stories

1. As a user, I want to tap the add button and see a single bottom sheet slide up smoothly, so that the experience feels polished and intentional.
2. As a user, I want to see my current screen (home, budgets, etc.) dimmed behind the sheet, so that I understand I am in a temporary sub-task without losing context.
3. As a user, I want to swipe the sheet downward to dismiss it, so that I can cancel adding an expense with a natural gesture.
4. As a user, I want to tap the dark backdrop behind the sheet to dismiss it, so that I have an easy escape without reaching for a close button.
5. As a user, I want the sheet to shift up when the keyboard appears, so that the field I am typing in is never hidden behind the keyboard.
6. As a user, I want to tap "Select category" and see the category list appear inside the same sheet, so that I never lose the amount or payment method I already entered.
7. As a user, I want to tap a back arrow inside the category list view to return to the form, so that I can change my mind without starting over.
8. As a user, I want the selected category to appear in the form immediately after I pick it, so that I can confirm my choice at a glance before saving.
9. As a user, I want the sheet to be tall enough (≈92% of screen height) to show the full category list without excessive scrolling, so that picking a category is fast.
10. As a user, I want the Save button to remain disabled until I have entered an amount and selected a category, so that I cannot accidentally log an incomplete expense.
11. As a user, I want to press the Save button and have the sheet dismiss automatically, so that the flow feels complete without an extra step.

## Implementation Decisions

- **Stack screen registration**: remove `presentation: 'modal'` from the `add-expense` Stack screen entry in the root layout. The screen remains a navigable route but contributes no overlay of its own.
- **gorhom BottomSheetModal**: the sheet is the sole overlay. Snap point: `['92%']`. `enablePanDownToClose: true`. A `BottomSheetBackdrop` component is configured with `pressBehavior: 'close'` and `disappearsOnIndex: -1` for tap-to-dismiss.
- **Keyboard avoidance**: `keyboardBehavior="interactive"` and `keyboardBlurBehavior="restore"` on the `BottomSheetModal` so the sheet translates upward with the keyboard.
- **Internal view state**: a single `view: 'form' | 'category-picker'` state value controls which content is rendered inside `BottomSheetView`. No router navigation occurs within the sheet.
- **Category list inlined**: `listCategories(getDb())` is called once on mount (via `useMemo`) inside the sheet component. The `FlatList` (or `BottomSheetFlatList` for correct scroll behaviour inside gorhom) renders category rows with icon, name, and a checkmark for the currently selected category.
- **categoryPickerBridge removed**: `setCallback` / `callback` imports are removed from `add-expense`. The picked category flows directly into local state via a handler passed down to the inline picker view.
- **Header in category view**: when `view === 'category-picker'`, the sheet header shows a back arrow (using the same `NavBar` component pattern used elsewhere) and the title "Category". When `view === 'form'`, the header shows "Add Expense" and the close button.
- **`app/category-picker.tsx` route untouched**: the standalone route remains for any future use. Only `add-expense` stops pushing to it.

## Testing Decisions

A good test for this feature verifies external behavior — what the user sees and can do — not which internal view state variable is set.

The highest seam is the rendered output of `AddExpenseScreen`. The existing codebase has no component-level tests, so no prior art exists for seams here. The recommended seam is a single render test per meaningful user-visible state:

- Sheet mounts and calls `sheetRef.present()` on load
- Tapping the category row in the inline picker updates the displayed category name in the form header
- Save button is disabled when amount is empty or category is unset; enabled when both are present
- Tapping Save calls `insertExpense` and then `router.back()`

If the project adds component tests, these four cases form the test suite for this screen. No test should assert on the value of the `view` state variable directly.

## Out of Scope

- Editing or deleting categories from within the sheet
- Custom Payment Method values (fixed set: Cash, GCash, Card, Others)
- Recurring Rule creation from the add-expense sheet
- Any changes to the standalone `app/category-picker.tsx` route
- The `categoryPickerBridge` module itself — it may still be used by other callers; only the import in `add-expense` is removed

## Further Notes

- `BottomSheetFlatList` (from `@gorhom/bottom-sheet`) must be used for the category list instead of a plain `FlatList` to avoid scroll conflicts inside the sheet.
- The `BottomSheetModalProvider` currently wraps the sheet component's return. Once the sheet is the only overlay, the provider must remain — but it should live as high in the tree as practical (the root layout is the right place) to avoid re-mounting issues. Check whether a `BottomSheetModalProvider` already exists higher up before adding one inside the screen.
