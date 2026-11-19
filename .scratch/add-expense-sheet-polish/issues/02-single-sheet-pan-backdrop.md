# 02: Single-sheet category picker — pan-down and backdrop control

**What to build:** The sheet never remounts when switching between the add-expense form and the category picker. Swiping down while the category picker is open returns to the form — it does not dismiss the sheet. Tapping the backdrop while in the category picker also returns to the form. Swiping down or tapping the backdrop on the form view dismisses the sheet entirely. All form state (amount, payment method, date, notes, selected category) is preserved when navigating back from the category picker.

The backdrop component must be aware of the current view so it routes the tap correctly: back-to-form when in the category picker, full-dismiss when in the form.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A single `BottomSheetModal` instance is used — it does not remount when switching views
- [ ] Swiping down while in the category picker returns to the add-expense form (sheet stays open)
- [ ] Tapping the backdrop while in the category picker returns to the add-expense form
- [ ] Swiping down while in the form dismisses the sheet entirely
- [ ] Tapping the backdrop while in the form dismisses the sheet entirely
- [ ] Amount, payment method, date, and notes are intact after returning from the category picker
- [ ] `enablePanDownToClose` is `false` when the category picker is active, `true` when the form is active
