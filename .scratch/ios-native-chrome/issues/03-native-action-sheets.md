# 03: Native action sheets

**What to build:** Multi-choice interactions (e.g. expense long-press with edit/delete/cancel) use native iOS action sheets instead of custom modals or multi-button alerts. The root layout wraps with `ActionSheetProvider`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `@expo/react-native-action-sheet` is installed
- [ ] `ActionSheetProvider` wraps the root layout
- [ ] Any existing multi-choice interaction uses `showActionSheetWithOptions` with a cancel button
- [ ] Destructive options are styled with the iOS destructive (red) appearance
- [ ] Simple two-button confirmations (e.g. reset cycle) remain as `Alert.alert`
