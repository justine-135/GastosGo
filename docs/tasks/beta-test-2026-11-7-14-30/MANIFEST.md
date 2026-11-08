# Task Manifest — beta-test-2026-11-7-14-30

**Source report:** `docs/bugs/bug-report-2026-11-07-1430.md`  
**Session:** Reanimated crash investigation (Insights screen)  
**Date:** 2026-11-07  
**Total tasks:** 2

---

## Wave Plan

Both tasks touch different files and can be applied in parallel. The DEVOPS fix must be in place and the app rebuilt before the FE fix can be verified end-to-end, so verification is sequential even though the code edits are not.

| Wave | Task ID | Bug | Discipline | Files | Notes |
|------|---------|-----|------------|-------|-------|
| 0 (blocker) | TASK-DEVOPS-01 | BUG-01 | DEVOPS | `babel.config.js` | Reanimated plugin must be compiled in before any worklet code works |
| 1 (parallel-safe) | TASK-FE-01 | BUG-01 | FE | `app/(tabs)/insights.tsx` | Can be coded in parallel with Wave 0; verify only after Wave 0 rebuild |

---

## File-Conflict Map

No file conflicts — each task touches a distinct file.

| File | Task(s) |
|------|---------|
| `babel.config.js` | TASK-DEVOPS-01 only |
| `app/(tabs)/insights.tsx` | TASK-FE-01 only |

---

## Summary Table

| Discipline | P0 | P1 | P2 | P3 | Total |
|------------|----|----|----|----|-------|
| FE | 0 | 1 | 0 | 0 | 1 |
| DEVOPS | 0 | 1 | 0 | 0 | 1 |
| BE | — | — | — | — | 0 |
| DB | — | — | — | — | 0 |
| **Total** | **0** | **2** | **0** | **0** | **2** |

---

## Recommended Execution Order

1. Apply TASK-DEVOPS-01 (`babel.config.js`) and TASK-FE-01 (`insights.tsx`) in parallel.
2. Rebuild Metro with cache cleared (`npx expo start --clear`).
3. Verify: tap pie slices on Insights screen — crash must not occur and slice selection must work.

---

## Flagged Risks

- The missing Reanimated Babel plugin is a latent risk beyond this single crash: any other screen using `useAnimatedStyle`, `useSharedValue`, or `runOnJS` without the plugin compiled in may also silently misbehave. A broader Reanimated smoke test is recommended after the fix.
