# TASKS-FE — Beta Test 2026-11-10 12:10

Target agent: `rn-frontend-engineer`
Source report: `docs/bugs/bug-report-2026-11-10-1210.md`
Commit: `e7a2a2a`

---

## TASK-FE-01: Fix formatDate rendering dates one day behind for UTC+8 users

**Bug ref:** BUG-35
**Priority:** P1
**Type:** BUG
**Files touched:** `utils/format.ts`

### What's broken
`formatDate` calls `new Date(isoString)` where `isoString` is a bare date like `"2026-11-08"`. The JS spec treats bare ISO dates as UTC midnight, so UTC+8 users see `Nov 7 at 16:00` — one day behind — on every historical expense. Expected: the date shown matches the calendar date the user entered.

### Reproduction steps
1. Add an expense dated 2026-11-08.
2. View it in the Expenses list or Recent Transactions on a UTC+8 device.
3. Date label reads "Nov 7" instead of "Nov 8".

### Acceptance criteria
- [ ] `formatDate('2026-11-08')` returns a string containing "Nov 8" (not "Nov 7") when the device timezone is UTC+8.
- [ ] `formatDate` still works correctly for timestamps that already include a time component.
- [ ] No other callers of `formatDate` in the codebase are broken.

### Technical notes
Root cause: bare ISO date strings (`YYYY-MM-DD`) are parsed as UTC midnight per ECMA-262. Fix: append `T00:00:00` before passing to `new Date()`, which forces local-time parsing.

```ts
// line 38 of utils/format.ts — current
const d = new Date(isoDate);

// fix
const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00`);
```

This is the same class of UTC offset bug as BUG-29 / BUG-31 / BUG-32 (fixed in earlier batches). Those lived in BE/DB stubs; this one lives in the FE utility layer.

### Dependencies
None — parallel-safe.

---

## TASK-FE-02: Guard orphaned "ACTIVE" section header on empty Recurring tab

**Bug ref:** BUG-34
**Priority:** P2
**Type:** BUG
**Files touched:** `app/(tabs)/expenses.tsx`

### What's broken
The Recurring tab's `SectionList` always includes `{ title: 'Active', data: [] }` regardless of whether any active recurring rules exist. When the list is empty, a stray "ACTIVE" section header renders above the empty state component. Expected: no section header appears when there are no active rules.

### Reproduction steps
1. Open Expenses tab.
2. Switch to the Recurring sub-tab with no recurring rules added.
3. "ACTIVE" header appears above the empty state UI.

### Acceptance criteria
- [ ] With zero active recurring rules, the "ACTIVE" section header does not render.
- [ ] With at least one active recurring rule, the "ACTIVE" section header renders normally above the list items.
- [ ] Empty state component still renders correctly when no rules exist.

### Technical notes
Lines 235-237 of `app/(tabs)/expenses.tsx`. Guard the section inclusion:

```ts
// current
sections={[{ title: 'Active', data: activeRules }, { title: 'Paused', data: pausedRules }]}

// fix — only include section if it has data
sections={[
  ...(activeRules.length > 0 ? [{ title: 'Active', data: activeRules }] : []),
  ...(pausedRules.length > 0 ? [{ title: 'Paused', data: pausedRules }] : []),
]}
```

Apply the same guard to the "Paused" section for consistency.

### Dependencies
None — parallel-safe.

---

## TASK-FE-03: Investigate missing MonthNavigator on Dashboard

**Bug ref:** BUG-36
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** `app/(tabs)/index.tsx`

### What's broken
The Dashboard (Home tab) displays the current month as plain read-only text. There is no `MonthNavigator` component, so users cannot navigate to prior months from the home screen. All other summary tabs (Budgets, Insights) presumably have month navigation. Expected behavior is unclear — confirm with PM whether this omission is intentional before implementing anything.

### Reproduction steps
1. Open the Home tab.
2. Observe the month label — it is static text with no tap target or chevrons.
3. Compare with Budgets or Insights tab month selectors.

### Acceptance criteria
- [ ] PM/design decision documented: either (a) MonthNavigator is intentionally absent from Dashboard, or (b) a follow-up BUG task is filed to add it.
- [ ] If intentional: add a brief code comment at the month display site in `index.tsx` explaining the design decision so future developers do not re-file this.
- [ ] If not intentional: replace static text with the existing `MonthNavigator` component used on other tabs and verify month-change propagates to dashboard query hooks.

### Technical notes
Before implementing, check:
1. Whether a `MonthNavigator` component already exists and is used on Budgets/Insights tabs.
2. Whether the dashboard query hooks accept a month parameter or always read current month.
3. Whether this was a deliberate simplification for the initial beta.

This task is intentionally scoped as INVESTIGATION — do not add the component until the design intent is confirmed.

### Dependencies
None — parallel-safe. But do not implement MonthNavigator on Dashboard until PM sign-off is obtained.

---

## TASK-FE-04: Extend budget cycle day picker to 31 or add explanatory text

**Bug ref:** BUG-37
**Priority:** P3
**Type:** BUG
**Files touched:** `app/settings.tsx`

### What's broken
The budget cycle start day picker in Settings is capped at day 28 (`Array.from({ length: 28 }, ...)`). Users whose pay date falls on 29, 30, or 31 cannot select their actual cycle start. No explanation is shown. Expected: days 1–31 are selectable, or at minimum an explanatory note is shown for why the picker is capped.

### Reproduction steps
1. Settings → Budget → Budget Cycle Starts.
2. Observe the grid — only days 1–28 appear.

### Acceptance criteria
- [ ] Option A (preferred): Grid shows days 1–31. App handles months with fewer days gracefully (e.g., Feb 29 falls back to last day of month).
- [ ] Option B (acceptable if Option A deferred): Grid remains capped at 28 but a brief inline note explains the cap (e.g., "Days 1–28 only, to work across all months").
- [ ] No crash when a user has a saved cycle day > 28 and upgrades.

### Technical notes
Line 251 of `app/settings.tsx`:
```ts
Array.from({ length: 28 }, (_, i) => i + 1)
// change to:
Array.from({ length: 31 }, (_, i) => i + 1)
```
If extending to 31, confirm that all downstream budget-period calculations clamp correctly when the month is shorter (e.g., day 31 in February → Feb 28/29).

### Dependencies
None — parallel-safe.

---

## TASK-FE-05: Clean up double-falsy savings target pattern in onboarding

**Bug ref:** BUG-33
**Priority:** P3
**Type:** BUG
**Files touched:** `app/onboarding/budget.tsx`

### What's broken
Line 36 of `app/onboarding/budget.tsx` uses `parseFloat(savingsTarget ?? '0') || undefined`. The `|| undefined` coerces `0` to `undefined`, which only works today because `insertProfile` has a default of `0` for the savings target field. The intent (pass `undefined` when empty, pass the actual value otherwise) is not expressed clearly, and the pattern would silently misfeed any future handler that accepts explicit `0`.

### Reproduction steps
1. Onboarding → enter "0" in the savings target field.
2. The stored value is `0` (correct), but only because `insertProfile` defaults it — not because `0` was explicitly passed.

### Acceptance criteria
- [ ] The expression makes the intent explicit: pass `undefined` when the field is blank/empty, pass the parsed number (including `0`) otherwise.
- [ ] Entering "0" explicitly stores `0` via the passed value, not via the `insertProfile` default.
- [ ] No behavior change for the happy path (non-zero value or blank field).

### Technical notes
Suggested fix:
```ts
// current — fragile: 0 || undefined === undefined
parseFloat(savingsTarget ?? '0') || undefined

// fix — explicit intent
savingsTarget?.trim() ? parseFloat(savingsTarget) : undefined
```
This passes `undefined` when the field is blank and passes the parsed number (including `0`) when the user typed something. Edge case: `parseFloat` of a non-numeric string returns `NaN` — add a `Number.isNaN` guard if input is not already validated upstream.

### Dependencies
None — parallel-safe.
