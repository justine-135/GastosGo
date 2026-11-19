# 01: Design tokens + Inter font

**What to build:** A shared token file and font setup that every screen imports. Developers reference named constants (e.g. `colors.brand`, `shadows.sm`, `typography.sectionLabel`) instead of raw hex values or magic numbers. Inter is loaded via `expo-font` and applied globally.

**Blocked by:** None (can start immediately)

**Status:** done

- [ ] `src/theme/colors.ts` — all color tokens from the design spec: brand, semantic (green/amber/red/gold), neutrals
- [ ] `src/theme/shadows.ts` — `sm`, `md`, `lg`, `fab` shadow objects (React Native `shadow*` + `elevation`)
- [ ] `src/theme/typography.ts` — font size, weight, and letter-spacing constants for every role in the spec
- [ ] `src/theme/spacing.ts` — screen horizontal padding, border radii, status bar height, nav/tab bar heights
- [ ] `src/theme/index.ts` — re-exports all four modules as a single `theme` import
- [ ] Inter font loaded via `expo-font` in the root layout; `useFonts` hook with fallback until loaded; `fontFamily: 'Inter'` applied to all text via a base style
- [ ] No screen styles changed in this ticket — tokens only
