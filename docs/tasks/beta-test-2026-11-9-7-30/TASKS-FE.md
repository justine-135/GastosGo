# Frontend Tasks — Beta Test 2026-11-09 07:30

Target agent: `rn-frontend-engineer`

---

## TASK-FE-01: Add "Not now" button to OnboardingNotifications screen

**Bug ref:** BUG-03
**Priority:** P2
**Type:** UX/UI
**Files touched:** `app/onboarding/notifications.tsx`

### What's broken

The onboarding Notifications screen renders a "Skip" button but no "Not now" button. PRD Feature 7 requires the notifications step to present a clearly labelled opt-out so users know they are dismissing the prompt, not skipping the entire step. The Maestro flow 02-onboarding.yaml attempts to tap "Not now" (optional), which silently fails, then falls back to tapping "Skip" — the user may never see a dismissal option with that specific label.

### Reproduction steps

1. Run a fresh onboarding flow (`clearState: true`).
2. Advance through Welcome → Income → Budget → PIN steps.
3. Observe the Notifications screen — only "Enable Notifications" and "Skip" buttons are present.
4. "Not now" label is absent.

### Acceptance criteria

- [ ] The Notifications screen renders two dismissal-tier buttons: "Enable Notifications" (primary CTA) and "Not now" (secondary/tertiary skip).
- [ ] "Not now" taps navigate to the next step (same behaviour as the current "Skip").
- [ ] The existing "Skip" button is either relabelled to "Not now" or a second button is added per PRD wording — confirm with product before choosing which.
- [ ] `accessibilityLabel="Skip notifications setup"` updated to match the visible label.
- [ ] Maestro flow 02-onboarding.yaml "Not now" optional tap resolves without warning after this change.

### Technical notes

Current skip button (line 57-65 of `app/onboarding/notifications.tsx`):

```tsx
<TouchableOpacity
  style={styles.skipBtn}
  onPress={handleSkip}
  accessibilityLabel="Skip notifications setup"
>
  <Text style={styles.skipBtnText}>Skip</Text>
</TouchableOpacity>
```

Simplest fix: change `<Text>Skip</Text>` to `<Text>Not now</Text>` and update the `accessibilityLabel`. Confirm with product whether "Skip" should be retained as a second button or simply relabelled.

### Dependencies

None — parallel-safe.

---

## TASK-FE-02: Investigate and fix Recent Transactions display format (merchant vs. category)

**Bug ref:** BUG-02
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** `app/(tabs)/index.tsx`, `e2e/03-add-expense.yaml`

### What's broken

Recent Transactions rows show "Food" (category name) instead of "Jollibee" (merchant name) for an expense where a merchant was entered. PRD requires merchant to be surfaced. The DashboardScreen code at line 183 already does `expense.merchant ?? expense.categoryName` — the display logic is correct but the `merchant` field appears to be null in the returned row, which forces the fallback to category.

Two possible root causes requiring investigation before any fix:
1. The Maestro 03-add-expense flow does not scroll the form to the merchant field and never inputs a value — so the row is inserted with `merchant = null`.
2. If merchant is populated, the PRD format `"Jollibee · Food"` (merchant + category concatenated) differs from the current `merchant ?? category` (merchant alone), requiring a display change.

This task covers the FE display format decision. The Maestro flow fix is in TASK-DEVOPS-02.

### Reproduction steps

1. Add expense: amount=250, category=Food, merchant=Jollibee, payment=GCash (manually, not via Maestro).
2. Return to Dashboard.
3. Check Recent Transactions row — confirm whether it shows "Jollibee" or "Food".
4. If "Food": query the SQLite DB to confirm `merchant` column is null (data-layer bug — escalate to BE).
5. If "Jollibee": PRD requires `"Jollibee · Food"` format — update display code.

### Acceptance criteria

- [ ] If merchant is set, the row primary label shows merchant name (at minimum) — not category name alone.
- [ ] If PRD format `"merchant · category"` is confirmed by product, line 182-184 of `app/(tabs)/index.tsx` is updated to `{expense.merchant ? \`${expense.merchant} · ${expense.categoryName}\` : expense.categoryName}`.
- [ ] If merchant is null in the DB for existing test data, this task is marked blocked on TASK-BE-01 (data-layer fix).

### Technical notes

Dashboard display line (index.tsx:183):
```tsx
{expense.merchant ?? expense.categoryName}
```
The stubs layer (`lib/db/stubs.ts` lines 200-210) includes `merchant` in the `expenseWithCategory` select and maps it in `rowToExpense` (line 189) — query layer is correct. If `merchant` is null at render time, the value was never written to the DB.

Needs product decision: relabel to "Not now" or dual-button layout before filing as a confirmed code fix.

### Dependencies

Coordinate with TASK-DEVOPS-02 (Maestro 03-add-expense flow — merchant field never filled).
