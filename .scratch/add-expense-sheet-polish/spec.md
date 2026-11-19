Status: ready-for-agent

# Add Expense Sheet — Polish: Transparent Route & Single-Sheet Category Picker

## Problem Statement

Two UX regressions on iPhone after the initial sheet rework:

1. Opening the add-expense sheet shows a white full-screen view sliding up behind the gorhom sheet. The Stack route animates in as a normal screen, so the user sees two things moving: the white screen slide-up and the sheet slide-up on top of it. The expected experience is: background stays visible (dimmed), only the sheet animates up.

2. When the category picker view is open inside the sheet and the user swipes down, the entire sheet dismisses — returning to the tab screen. The user expects swipe-down on the category picker to navigate back to the add-expense form, not close the whole flow.

## Solution

1. Register the add-expense route as a `transparentModal` in the Stack. This removes the route's own slide animation entirely and lets the gorhom backdrop handle background dimming. The tab screen remains visible and darkened behind the sheet — no white screen flies up.

2. Consolidate to a single `BottomSheetModal` instance that never remounts across view changes. Pan-down-to-close is enabled only on the form view. On the category picker view it is disabled — the back arrow and category selection are the only exits. `onDismiss` always calls `router.back()`.

## User Stories

1. As a user, I want to tap the add button and see only the bottom sheet slide up — not a white screen behind it — so that the transition feels native and focused.
2. As a user, I want the screen I was on (home, budgets, etc.) to remain visible but dimmed behind the sheet, so that I always know where I am in the app.
3. As a user, I want no slide-up animation for the background screen when the sheet opens, so that the opening feels like a sheet, not a page navigation.
4. As a user, I want to swipe down on the category picker inside the sheet to go back to the add-expense form, so that I can change my mind without closing the whole flow.
5. As a user, I want the add-expense form state (amount, payment method, date, notes) to be preserved when I swipe down from the category picker, so that I do not have to re-enter what I already typed.
6. As a user, I want to swipe down on the add-expense form to dismiss the sheet entirely, so that I can cancel adding an expense with a natural gesture.
7. As a user, I want tapping the backdrop to dismiss the sheet from the form view, so that I have a quick escape.
8. As a user, I want tapping the backdrop while in the category picker to go back to the add-expense form, so that an accidental tap does not lose my partially filled form.
9. As a user, I want to see a smooth slide animation when transitioning between the form and the category picker, so that the navigation feels intentional and directional.

## Implementation Decisions

- **Stack screen registration**: the add-expense route uses `presentation: 'transparentModal'` and `headerShown: false`. This removes the Stack's own slide animation and prevents the white background from rendering.
- **Single BottomSheetModal**: the component renders one `BottomSheetModal` regardless of which view is active. View state (`'form' | 'category-picker'`) controls content only — it does not cause the modal to remount.
- **Pan-down-to-close**: `enablePanDownToClose` is set dynamically — `true` when `view === 'form'`, `false` when `view === 'category-picker'`. This ensures swipe-down on the category picker navigates back to the form rather than dismissing the sheet.
- **Backdrop press behaviour**: on the category picker view, pressing the backdrop navigates back to the form (not full dismiss). On the form view, pressing the backdrop dismisses the sheet entirely. Implemented by passing a custom `backdropComponent` that calls `setView('form')` when `view === 'category-picker'` and `sheetRef.current?.dismiss()` when `view === 'form'`.
- **`onDismiss`**: always calls `router.back()`. This only fires when the sheet is fully closed (swipe-down on form, or programmatic dismiss after save).
- **Content rendering**: `BottomSheetView` wraps the form. When `view === 'category-picker'`, the content area switches to `BottomSheetFlatList` with the category list and a `ListHeaderComponent` containing the back-arrow header. Because it is a single modal instance, transitions between views use a horizontal slide animation — form slides left out / picker slides in from right when opening the picker, and reverses when going back. Implemented with `Animated` translate values, mirroring the existing press-state animation pattern already in the file.

## Testing Decisions

A good test verifies external behaviour — what the user experiences — not which internal view state is set or how many times a ref method was called.

The seam is the rendered output of the add-expense screen. No component tests exist in the codebase, so there is no prior art. If tests are added, the meaningful cases are:

- Sheet is presented on mount
- Tapping "Select category" switches to the category list view (back arrow visible, form fields not visible)
- Swiping down (simulated `onDismiss`) while in category picker view calls `setView('form')`, not `router.back()`
- Swiping down while in form view calls `router.back()`
- Picking a category returns to the form with the category name shown and form state intact
- Save calls `insertExpense` and then `router.back()`

No test should assert on the value of the `view` state variable directly.

## Out of Scope

- Animated transitions between views other than the specified horizontal slide (e.g. cross-fade, scale)
- Haptic feedback on view transitions
- Search/filter inside the category picker
- Any changes to the standalone `app/category-picker.tsx` route
- Changes to the gorhom backdrop opacity or colour

## Further Notes

- `transparentModal` on iOS removes the dimming the Stack would normally apply to the presenting screen — the gorhom `BottomSheetBackdrop` is now solely responsible for dimming. Confirm the backdrop opacity looks correct on device after this change.
- Because the modal does not remount on view change, `sheetRef.current?.present()` only needs to fire once on mount. The existing `useEffect` with an empty dependency array handles this correctly.
- Disabling `enablePanDownToClose` dynamically on a mounted sheet is supported by gorhom — the prop is read on each render.
