# 02: Fix double-overlay — single sheet, correct dismiss, keyboard avoidance

**What to build:** The add-expense flow opens exactly one bottom sheet. Removing `presentation: 'modal'` from the Stack screen registration means the Stack no longer contributes its own overlay. The gorhom `BottomSheetModal` is the sole overlay at 92% snap height. A semi-transparent backdrop is visible behind the sheet; tapping it dismisses the sheet. Swiping the sheet downward also dismisses it. When the user focuses a text field the sheet shifts upward so the field is never hidden behind the keyboard. All existing form fields (amount, payment method, date, notes, save button) work as before. Category selection still temporarily uses the existing approach — that is replaced in ticket 03.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Tapping the add button opens one sheet — no double-overlay animation
- [ ] Sheet snaps to 92% height
- [ ] Dark semi-transparent backdrop is visible behind the sheet
- [ ] Tapping the backdrop dismisses the sheet
- [ ] Swiping the sheet downward dismisses the sheet
- [ ] Focusing the amount or notes field causes the sheet to shift up above the keyboard
- [ ] Amount, payment method, date, notes, and save button all behave correctly
- [ ] Save logs the expense and dismisses the sheet
- [ ] `presentation: 'modal'` is removed from the `add-expense` Stack screen entry in the root layout
