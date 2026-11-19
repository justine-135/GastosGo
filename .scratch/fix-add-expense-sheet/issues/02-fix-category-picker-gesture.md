# 02: Fix category picker — resolve gesture conflict

**What to build:** Tapping "Select category" on the Add Expense form should slide the category list into view. Picking a category should slide back to the form with the chosen category name shown. The category row on the form must respond to touch with visible press feedback.

Root cause: `BottomSheetFlatList` mounts off-screen in the category picker page and registers a gorhom gesture handler that intercepts touches meant for the form — including the category row Pressable. Replacing it with a plain `ScrollView` removes the gesture conflict.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Tapping "Select category" shows press feedback on the row
- [ ] The category list slides in from the right when "Select category" is tapped
- [ ] Tapping a category slides back to the form with the category name populated
- [ ] Tapping the back arrow in the category picker slides back to the form
- [ ] Tapping the backdrop while the category picker is open returns to the form (does not close the sheet)
- [ ] The category list is scrollable if it overflows the sheet height
- [ ] The slide viewport fills the sheet height correctly (no collapsed or clipped content)
