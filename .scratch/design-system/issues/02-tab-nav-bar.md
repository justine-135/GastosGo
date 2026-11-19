# 02: Tab bar + Nav bar components

**What to build:** A frosted-glass tab bar with a center FAB and a nav bar component that all screens can use, both matching the design spec. Replaces expo-router's default tab bar rendering.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Custom tab bar component (`src/components/TabBar.tsx`) — 83px height, frosted glass (`rgba(250,250,248,0.85)` + `BlurView`), 0.5px top border, 4 tabs + center FAB
- [ ] Tab items: 24×24 icon + 10px/500 label; inactive = `gray-2`, active = `brand`; icon SVG press scales to 0.9 (100ms)
- [ ] Center FAB: 50×50 circle, brand gradient (`145deg, #7389F9 → #4F6EF7`), `+` icon, FAB shadow; press scales to 0.90 (120ms), shadow reduces
- [ ] Wire custom tab bar into `app/(tabs)/_layout.tsx` via `tabBar` prop
- [ ] `src/components/NavBar.tsx` — 96px total (44px status + 52px bar), same frosted glass, 0.5px bottom border; props: `title`, optional `rightLabel`+`onRight`, back button (40×40 circle, brand `‹`, press = `scale(0.92)` + bg circle)
- [ ] NavBar used in add-expense sheet header and any push screens (Budget Edit, Settings sub-screens, Category Picker)
- [ ] Animation: button press states via `Animated.spring` or `useSharedValue` (Reanimated already installed)
