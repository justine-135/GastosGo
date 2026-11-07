# DevOps Tasks — beta-test-2026-11-6-14-0

**Target agent:** `devops-pipeline-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-06-1358.md`

---

## TASK-DEVOPS-01: Suppress Expo LogBox warning banner during Maestro E2E runs

**Bug ref:** BUG-04
**Priority:** P3
**Type:** UX/UI
**Files touched:** `app/_layout.tsx`

### What's broken
A yellow "Open debugger to view warnings" banner appears at the bottom of every screen in every Maestro screenshot. This is Expo's LogBox that surfaces in development builds when warnings are present. It pollutes all E2E screenshots and can obscure UI elements that Maestro assertions depend on. It is not a production concern, but it degrades the reliability of automated visual checks and the experience for beta testers on dev builds.

### Reproduction steps
Visible in every Maestro screenshot across all 4 flows (01-smoke, 02-onboarding, 03-add-expense, 04-navigation).

### Acceptance criteria
- [ ] Yellow LogBox banner is not visible in Maestro screenshots during E2E runs.
- [ ] Underlying warnings are still surfaced in the Metro console (not silenced globally).
- [ ] No real development warnings are hidden from developers working locally.

### Technical notes
Two options in `app/_layout.tsx`:

**Option A (preferred — targeted):** Identify what warning(s) are triggering the banner from Metro logs. Fix the underlying warning (e.g. a missing `key` prop, a deprecated API). No LogBox config change needed.

**Option B (acceptable — E2E scoped):** Add at the top of `app/_layout.tsx`:
```ts
import { LogBox } from 'react-native';
if (process.env.EXPO_E2E === 'true') {
  LogBox.ignoreAllLogs(true);
}
```
Then set `EXPO_E2E=true` in the environment used for Maestro runs (e.g. in `package.json` scripts or the Metro launch command in the e2e-test skill). This keeps warnings visible during normal dev.

**Option C (avoid):** `LogBox.ignoreAllLogs(true)` unconditionally — this hides real warnings from developers. Do not use.

Start with Option A: check Metro output during a Maestro run for the specific warning text, then decide whether to fix or suppress it.

### Dependencies
None — parallel-safe. Wave 1.
