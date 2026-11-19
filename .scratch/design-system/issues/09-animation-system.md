# 09: Animation system — press states + progress bars

**What to build:** All remaining interactive elements across the app gain their spec-defined press states, and any progress bar not yet spring-animated gets its fill transition. This is a polish pass after all screens are landed.

**Blocked by:** 03, 04, 05, 06, 07, 08

**Status:** ready-for-agent

- [ ] Audit all `TouchableOpacity` / pressable elements across the app; replace with `Pressable` + Reanimated `useSharedValue` where a scale or opacity animation is needed
- [ ] Press scale targets per spec: primary button `scale(0.97)`, secondary button `scale(0.97)`, small button `scale(0.95)`, mode card `scale(0.98)`, nav back button `scale(0.92)` + bg circle; all 120ms `ease-out`
- [ ] FAB press: `scale(0.90)` + shadow reduces; 120ms
- [ ] List/expense/budget row press: background → `gray-light` (120ms) — verify consistency across all row types
- [ ] Progress bar fills: confirm all bars use spring (500ms `ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`) on mount; add to any bar added in tickets 03–06 that was deferred
- [ ] Toggle thumb spring: 250ms `ease-spring` (verify Budget Edit and Income Mode toggles)
- [ ] Semantic color transitions on Savings Gap card hero amount + status pill: 400ms `ease-out` (verify ticket 03 implemented this; add if not)
