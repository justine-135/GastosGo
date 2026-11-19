# 01: Hoist BottomSheetModalProvider to root layout

**What to build:** Move the `BottomSheetModalProvider` from inside `add-expense` up to the root layout so it wraps the entire app. This is a prefactor — nothing changes visually. It unblocks the sheet rework by ensuring the provider is never torn down and remounted when the add-expense route mounts or unmounts.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `BottomSheetModalProvider` wraps the app in the root layout (inside `GestureHandlerRootView`)
- [ ] `BottomSheetModalProvider` is no longer imported or rendered inside the add-expense screen
- [ ] App behaviour is unchanged — no visual regression on any screen
