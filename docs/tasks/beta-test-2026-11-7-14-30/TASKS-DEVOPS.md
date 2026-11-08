# DevOps Tasks — beta-test-2026-11-7-14-30

**Target agent:** `devops-pipeline-engineer`  
**Source report:** `docs/bugs/bug-report-2026-11-07-1430.md`

---

## TASK-DEVOPS-01: Add react-native-reanimated/plugin to babel.config.js

**Bug ref:** BUG-01 (Insights / Pie Chart crash)  
**Priority:** P1  
**Type:** BUG  
**Files touched:** `babel.config.js`

### What's broken

`react-native-reanimated/plugin` is absent from `babel.config.js`. Without it, Reanimated's worklet compiler never runs at build time, so any function marked `'worklet'` or any `useAnimatedStyle` / gesture callback that depends on UI-thread execution is broken at runtime. The immediate symptom is the Insights pie chart crash, but the missing plugin is a latent risk for all Reanimated usage in the app.

### Reproduction steps

1. Open `babel.config.js` — confirm `react-native-reanimated/plugin` is not in the `plugins` array.
2. Run `npx expo start --clear` and open the Insights tab.
3. Tap any pie slice — app crashes with the Reanimated UI-thread error.

### Acceptance criteria

- [ ] `"react-native-reanimated/plugin"` is the **last** entry in the `plugins` array in `babel.config.js` (Reanimated's docs require it to be last).
- [ ] Metro cache is cleared after the change (`--clear` flag or `npx expo start --clear`).
- [ ] App builds without Babel errors.
- [ ] The Reanimated worklet infrastructure no longer throws at runtime (verified in combination with TASK-FE-01).

### Technical notes

Current `babel.config.js` plugins array:

```js
plugins: [
  ["inline-import", { extensions: [".sql"] }],
  "@babel/plugin-transform-class-static-block"
]
```

Required state after change:

```js
plugins: [
  ["inline-import", { extensions: [".sql"] }],
  "@babel/plugin-transform-class-static-block",
  "react-native-reanimated/plugin"   // must be last
]
```

`react-native-reanimated` is already an installed dependency — no package install needed.

### Dependencies

None — parallel-safe. This fix must be applied and the app rebuilt before the TASK-FE-01 fix can be fully verified, but the file edits themselves do not conflict.
