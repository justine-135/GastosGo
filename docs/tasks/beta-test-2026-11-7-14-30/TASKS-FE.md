# Frontend Tasks — beta-test-2026-11-7-14-30

**Target agent:** `rn-frontend-engineer`  
**Source report:** `docs/bugs/bug-report-2026-11-07-1430.md`

---

## TASK-FE-01: Wrap Pie.Slice onPress with runOnJS to fix UI-thread crash

**Bug ref:** BUG-01 (Insights / Pie Chart crash)  
**Priority:** P1  
**Type:** BUG  
**Files touched:** `app/(tabs)/insights.tsx`

### What's broken

Tapping any slice on the donut pie chart crashes the app with:

```
Uncaught Error [Reanimated] Tried to synchronously call a non-worklet function onPress on the UI thread
```

`victory-native` v41's `Pie.Slice` calls its `onPress` prop directly on the Reanimated UI thread via a gesture handler. The current callback at line 183 is a plain JS function (`onSelect`), which cannot be called synchronously from the UI thread. It must be marshalled back to the JS thread with `runOnJS`.

### Reproduction steps

1. Navigate to the Insights tab.
2. Tap any slice on the donut pie chart.
3. App crashes immediately.

### Acceptance criteria

- [ ] Tapping a pie slice no longer crashes the app.
- [ ] Tapping a pie slice still selects the slice and updates the legend/detail view as before.
- [ ] `runOnJS` is imported from `react-native-reanimated` at the top of `insights.tsx`.
- [ ] The `onPress` prop on `Pie.Slice` uses a worklet wrapper: `() => { 'worklet'; runOnJS(onSelect)(slice.data.id as string); }`.

### Technical notes

Current code at `app/(tabs)/insights.tsx:183`:

```tsx
onPress={() => onSelect(slice.data.id as string)}
```

Required change:

```tsx
// Add to imports:
import { runOnJS } from 'react-native-reanimated';

// Line 183:
onPress={() => { 'worklet'; runOnJS(onSelect)(slice.data.id as string); }}
```

The `'worklet'` directive marks the inline function as a worklet so Reanimated compiles it for the UI thread; `runOnJS` then safely delegates the `onSelect` call back to the JS thread.

Bar chart and legend `TouchableOpacity` elements are unaffected — they are not Reanimated gesture components.

### Dependencies

Depends on **TASK-DEVOPS-01** (Reanimated Babel plugin) being applied and the app rebuilt before this fix can be verified end-to-end. However, the code change itself is parallel-safe — both tasks touch different files.
