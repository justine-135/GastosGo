# 03: Horizontal slide transition between form and category picker

**What to build:** Tapping "Select category" slides the form out to the left and slides the category picker in from the right. Navigating back (back arrow, swipe-down, or backdrop tap) reverses the animation — picker slides out to the right, form slides back in from the left. The transition uses `Animated` translate values, consistent with the press-state animation pattern already in the screen. Duration should feel snappy — around 250ms.

**Blocked by:** 02 (single-sheet category picker must be in place first)

**Status:** ready-for-agent

- [ ] Tapping "Select category" animates the form sliding out to the left and the picker sliding in from the right
- [ ] Navigating back from the category picker reverses the animation
- [ ] Animation uses `Animated` translate values with `useNativeDriver: true`
- [ ] Duration is approximately 250ms
- [ ] No jank or layout jump during the transition
- [ ] Form state is fully visible and correct when the reverse animation completes
