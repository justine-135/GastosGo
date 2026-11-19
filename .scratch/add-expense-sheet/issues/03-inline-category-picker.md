# 03: Inline the Category picker inside the sheet

**What to build:** Tapping "Select category" no longer pushes to the `/category-picker` route. Instead, the sheet content swaps to an inline category list. The user picks a category and the sheet returns to the form with the selection applied and all other form state (amount, payment method, date, notes) intact. A back arrow in the sheet header returns to the form without making a selection. The `categoryPickerBridge` import is removed from the add-expense screen. `BottomSheetFlatList` is used for the category list to avoid scroll conflicts inside the sheet.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Tapping "Select category" shows the category list inside the sheet (no route navigation)
- [ ] Sheet header shows a back arrow and "Category" title when in category picker view
- [ ] Tapping a category row returns to the form with the category name shown in the category field
- [ ] All other form state is preserved when returning from the category picker view
- [ ] Tapping the back arrow returns to the form without changing the selected category
- [ ] A checkmark is shown next to the currently selected category in the list
- [ ] `categoryPickerBridge` is not imported or used in the add-expense screen
- [ ] `BottomSheetFlatList` is used to render the category list
- [ ] `app/category-picker.tsx` route is not modified
