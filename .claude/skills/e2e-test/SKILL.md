---
name: e2e-test
description: Run Maestro E2E flows on a real Android emulator. Auto-starts the emulator and Metro if needed, validates results against PRD acceptance criteria, then writes a bug report.
triggers:
  - /e2e-test
---

Run runtime E2E tests on the GastosGo Android emulator. Follow these steps in order.

---

## Step 1 — Read the PRD

Read `docs/gastosgo-prd.md`. Load the user stories and acceptance criteria from Section 6.
These are the ground truth for what the app must do — you will cross-check observed behavior
against them after the Maestro runs.

---

## Step 2 — Check emulator

Run:
```
adb devices
```

If no `emulator-` line is listed:

```powershell
Start-Process -FilePath "C:\Users\Win 10\AppData\Local\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd", "Pixel_8" -WindowStyle Normal
```

Then wait for boot — poll every 5 s, timeout 120 s:
```
adb wait-for-device
adb shell getprop sys.boot_completed
```
Continue once it returns `1`.

---

## Step 3 — Check Metro bundler

Run:
```powershell
Test-NetConnection localhost -Port 8081 -InformationLevel Quiet
```

If the result is `False`, start Metro in background:
```bash
npx expo start --port 8081
```
(use `run_in_background: true`). Wait 15 s before proceeding.

---

## Step 4 — Check app installed

Run:
```
adb shell pm list packages com.gastosgo.app
```

If the package is not listed, stop and tell the user:
> App not installed on the emulator. Run `npx expo run:android` first, then re-run `/e2e-test`.

---

## Step 5 — Run Maestro flows

**Flow selection:**
- No args → run all 4 flows in order
- Args provided (e.g. `smoke`, `onboarding`, `add-expense`, `navigation`, or a filename) → run only matching flow(s)

**Flows (in order):**
| Arg alias | File |
|-----------|------|
| smoke | `e2e/01-smoke.yaml` |
| onboarding | `e2e/02-onboarding.yaml` |
| add-expense | `e2e/03-add-expense.yaml` |
| navigation | `e2e/04-navigation.yaml` |

**Run each flow:**
```
maestro test e2e/<flow>.yaml
```

Run sequentially. Capture the exit code (0 = pass, non-zero = fail) and any error output for each.

---

## Step 6 — Validate against PRD acceptance criteria

For each flow that **passed**, review what Maestro exercised and cross-check against the
acceptance criteria in Section 6 of the PRD. Flag any criterion that was:
- Not exercised at all by the flows run
- Visibly violated based on Maestro output or screenshots (e.g. wrong label, missing element,
  wrong currency, PIN not enforced, budget bar absent)

This catches regressions that Maestro won't catch on its own (Maestro only checks what the
YAML asserts; PRD checks what the app *should* do).

---

## Step 7 — Report

Output a table:

| Flow | Maestro | PRD criteria covered | Gaps / failures |
|------|---------|----------------------|-----------------|
| 01-smoke | ✓ PASS | Dashboard loads, Recent Transactions visible | — |
| 02-onboarding | ✗ FAIL | — | "Get Started" not found (timeout) |
| ... | | | |

Then one line:
> `N/4 flows passed · M PRD acceptance criteria gaps found`

---

## Step 8 — Run /bug-report

Invoke the `/bug-report` skill to write the session findings to `docs/bugs/` using the
standard format. Include both Maestro failures and PRD acceptance criteria gaps as bugs.
