# TASKS-DEVOPS — Beta Test 2026-11-10 12:05
**Target agent:** `devops-pipeline-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-10-1204.md`

---

## TASK-DEVOPS-01: Add conditional PIN-unlock block to 01-smoke.yaml

**Bug ref:** BUG-01
**Priority:** P1
**Type:** BUG
**Files touched:** `e2e/01-smoke.yaml`

### What's broken
The smoke flow (`e2e/01-smoke.yaml`) runs with `launchApp: stopApp: false`. When a PIN has been previously set and the app has been backgrounded for more than 30 seconds, it resumes to `LockScreen` (PIN entry) rather than the home screen. The flow has no PIN-entry step, so it times out waiting for "Recent Transactions" and fails. The PIN itself is known (123456 — set during onboarding).

### Reproduction steps
1. Complete onboarding and set PIN 123456.
2. Background the app for more than 30 seconds.
3. Run `maestro test e2e/01-smoke.yaml`.
4. Flow times out at the "Recent Transactions" assertion — LockScreen is visible instead.

### Acceptance criteria
- [ ] `e2e/01-smoke.yaml` passes on a device where a PIN has been previously set.
- [ ] The PIN-entry block is conditional (`when: visible: "Enter PIN"`) so the flow also passes on a fresh install with no PIN set.
- [ ] Each digit 1–6 is tapped in sequence, then the flow continues to assert "Recent Transactions".
- [ ] Flow passes on both cold-start (no PIN) and warm-start (PIN required) scenarios.

### Technical notes
Use Maestro's `runFlow` with a `when` condition, or an inline conditional block:

```yaml
- runFlow:
    when:
      visible: "Enter PIN"
    commands:
      - tapOn: "1"
      - tapOn: "2"
      - tapOn: "3"
      - tapOn: "4"
      - tapOn: "5"
      - tapOn: "6"
```

Place this block immediately after `launchApp` and before the first screen assertion. Verify the PIN digit tap targets match the actual `testID` or label values in `app/lock.tsx`. The LockScreen is a hotspot file (4 bugs across all batches) — do not modify `lock.tsx` itself in this task; only update the YAML flow.

### Dependencies
None — parallel-safe. ⚠️ `e2e/04-navigation.yaml` is also touched by TASK-FE-03 — coordinate if the same agent handles both DEVOPS and FE tasks, or sequence TASK-FE-03 after this task completes (they are different files so true parallel is safe).

---

## TASK-DEVOPS-02: Add E2E coverage for push notification opt-in and budget alert (Feature 7)

**Bug ref:** PRD gap — Feature 7; related to BUG-05 (notification skip label)
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** `e2e/02-onboarding.yaml`, `e2e/` (new flow TBD)

### What's broken
Two gaps:
1. The second "Skip" button on the notifications opt-out screen is absent or mis-labeled. In `02-onboarding.yaml` the second `tapOn: "Skip"` warns "Element not found". The flow continues because the tap is optional, but the notifications permission screen may be silently unreachable (Batch 6 BUG-03 established the pattern that label text must match exactly).
2. No flow tests budget threshold alerts (80%/100% warnings) or recurring bill reminder push notifications.

### Reproduction steps
1. Run `maestro test e2e/02-onboarding.yaml` and observe the "Element not found" warning after the biometrics "Not now" tap.
2. Inspect the notifications screen in the app — confirm the actual button label (may be "Not now", "Maybe later", or "Dismiss" rather than "Skip").

### Acceptance criteria
- [ ] `e2e/02-onboarding.yaml` second optional-screen tap uses the correct button label — no "Element not found" warning in the run log.
- [ ] A new flow or extended existing flow exercises the push notification permission grant path (not just skip).
- [ ] PRD Feature 7 coverage gap is documented if full push-notification assertion is blocked by emulator limitations (emulators may not deliver real FCM/APNs notifications).

### Technical notes
Inspect `app/onboarding/` (hotspot — 4 bugs across batches) for the notifications screen component and its button label text. From Batch 6 (BUG-03): `OnboardingNotifications` renders "Skip" not "Not now" — if that fix was applied, verify the label is now consistent. For budget alert testing, check whether the notification dispatch is synchronous (testable via app state) or async (requires a mock or background trigger). Do not add a dependency on real push tokens in the E2E flow — gate the assertion on what is reliably observable in the emulator.

### Dependencies
None — parallel-safe. Informs TASK-BE-01 (push reminder logic).
