# DevOps / Pipeline Tasks — Beta Test 2026-11-09 07:30

Target agent: `devops-pipeline-engineer`

---

## TASK-DEVOPS-01: Guard tab bar taps in 04-navigation.yaml against Metro dev banner overlay

**Bug ref:** BUG-01
**Priority:** P2
**Type:** BUG
**Files touched:** `e2e/04-navigation.yaml`

### What's broken

The Metro dev-tools warning banner ("Open debugger to view warnings.") overlays the bottom tab bar in dev builds. When Maestro taps `"Expenses"` by text, the banner intercepts the touch and the tab never switches — the app stays on Dashboard. The flow then times out waiting for `"🔁 Recurring"` (the Expenses screen landmark), causing flow 04 to fail.

The banner is a dev-environment artifact but the underlying risk is real: any system overlay (Android gesture nav bar, iOS home indicator) can sit close enough to a bottom tab bar to intercept taps on shorter devices. The fix belongs in the YAML, not the app code.

### Reproduction steps

1. Run app in dev mode with Metro warnings present (any warning generates the banner).
2. Run `e2e/04-navigation.yaml`.
3. Tap on "Expenses" tab — banner intercepts touch; app stays on Dashboard.
4. `extendedWaitUntil: visible: "🔁 Recurring"` times out at 15 s.

### Acceptance criteria

- [ ] 04-navigation.yaml dismisses the Metro/LogBox banner before the first tab tap — either via `tapOn: { text: "DISMISS", optional: true }` or via a coordinate tap at the banner's dismiss region.
- [ ] Alternatively (or additionally): all tab taps use `tapOn: { point: "X%, 95%" }` coordinates so they hit the tab bar icon center, bypassing any overlay at the top of the tab bar region.
- [ ] Flow 04 passes end-to-end (all 4 tabs navigated, all `assertNotVisible: "Recent Transactions"` assertions pass) with Metro running in dev mode.
- [ ] No regression on flows 01-03.

### Technical notes

Current 04-navigation.yaml tap sequence (lines 12-16):
```yaml
- tapOn: "Cancel"
  optional: true
- assertVisible: "Recent Transactions"
- tapOn: "Expenses"
- extendedWaitUntil:
    visible: "🔁 Recurring"
    timeout: 15000
```

The `tapOn: "Cancel"` optional guard already handles one dialog but not the LogBox banner. Add a LogBox dismiss guard after `assertVisible: "Recent Transactions"` and before the first tab tap:

```yaml
- tapOn:
    text: "DISMISS"
    optional: true
- tapOn:
    text: "DISMISS ALL"
    optional: true
```

If the banner does not expose a tappable text label, fall back to a coordinate tap at `"50%, 3%"` (banner typically renders at the top of the viewport). Confirm the banner's dismiss target by running the flow with `takeScreenshot` before the first tab tap.

The bug report also suggests verifying tab bar height on shorter devices — this is a follow-up observation, not a blocker for this task.

### Dependencies

None — parallel-safe.

---

## TASK-DEVOPS-02: Update 03-add-expense.yaml to scroll and fill the merchant field

**Bug ref:** BUG-02 (contributing cause)
**Priority:** P2
**Type:** BUG
**Files touched:** `e2e/03-add-expense.yaml`

### What's broken

The 03-add-expense Maestro flow does not scroll the AddExpenseModal to the merchant input and never inputs a merchant value. As a result, expenses inserted by the flow have `merchant = null` in the DB, which causes the Dashboard Recent Transactions row to fall back to showing the category name ("Food") instead of the merchant name ("Jollibee"). This is confirmed by the fact that the display code at `app/(tabs)/index.tsx:183` uses `expense.merchant ?? expense.categoryName`.

### Reproduction steps

1. Run `e2e/03-add-expense.yaml` as-is.
2. After the flow completes, query the DB or observe the Dashboard — the Recent Transactions row shows the category name, not a merchant.
3. Open the AddExpenseModal manually, scroll down — the merchant field exists below the payment method selector but is never reached by the flow.

### Acceptance criteria

- [ ] 03-add-expense.yaml scrolls the modal far enough to reveal the merchant input field.
- [ ] The flow inputs a merchant value (e.g. "Jollibee") into the merchant field.
- [ ] After the flow completes, the Dashboard Recent Transactions row shows "Jollibee" (or "Jollibee · Food" per the format confirmed by TASK-FE-02) rather than "Food".
- [ ] Flow 03 continues to pass all existing assertions.

### Technical notes

The AddExpenseModal merchant field was previously flagged in Batch 5 (TASK-FE-04 reclassification): the field exists at `app/modals/add-expense.tsx` lines 241-256 but is below fold — the form never scrolls. Same pattern applies here. Use `scroll` or a swipe gesture in Maestro to reach the merchant field before `tapOn` + `inputText`.

Confirm the merchant field's `testID` or `accessibilityLabel` by reading `app/modals/add-expense.tsx` before writing the YAML step.

### Dependencies

Coordinate with TASK-BE-01 (investigate whether merchant is null in the DB) and TASK-FE-02 (display format decision). This task can proceed in parallel — fix the YAML regardless of product decision on display format.
