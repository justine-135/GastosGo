# TASKS-FE.md — React Native Frontend
**Target agent:** `rn-frontend-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-06-1430.md`
**Date:** 2026-11-06

---

## TASK-FE-01: Pass and persist salary value from onboarding income screen through to insertProfile

**Bug ref:** BUG-28
**Priority:** P1
**Type:** BUG
**Files touched:** `app/onboarding/income.tsx`, `app/onboarding/budget.tsx`

### What's broken
`app/onboarding/income.tsx` collects the salary amount in local state and passes it via `router.push` params to the budget screen. `app/onboarding/budget.tsx` receives `salary` as a string param and already calls `insertProfile({ monthlySalary: parseFloat(salary) })`. The chain is wired correctly at the screen level. However, `insertProfile` in `lib/db/stubs.ts` discards `monthlySalary` because the schema column does not exist yet (TASK-DB-01 fixes that). No FE code change is strictly required once the DB and BE tasks land — but this task exists to verify the param thread end-to-end and add a smoke test assertion.

### Reproduction steps
1. Onboarding → Fixed Salary → enter ₱25,000 → Continue.
2. Set any budget → Done.
3. Navigate to Dashboard → Savings Gap.
4. Income field shows ₱0 instead of ₱25,000.

### Acceptance criteria
- [ ] After TASK-DB-01 and TASK-BE-03 land, re-run this screen flow: Savings Gap shows the entered salary.
- [ ] `salary` param is not silently truncated or coerced to `NaN` (guard: `parseFloat(salary ?? '0') || 0` already present in `budget.tsx` — verify it handles empty string correctly).
- [ ] No new navigation logic is added; existing router.push param passing is correct.

### Technical notes
`income.tsx` line 31–38: `router.push` with `salary` param — no change needed.
`budget.tsx` line 33: `monthlySalary: parseFloat(salary ?? '0') || undefined` — already passes the value. The `|| undefined` coerces `0` to `undefined`; that is acceptable because `monthlySalary = 0` and `monthlySalary = undefined` are treated the same way in `getSavingsGap` (both fall back to 0 income). If a user enters exactly `₱0`, consider changing to `|| 0` — but this is cosmetic, not a blocker.

### Dependencies
Blocked by TASK-DB-01 (schema column) and TASK-BE-03 (stubs.ts write path). FE code itself needs no edit — this task is a verification pass after those land.

---

## TASK-FE-02: Show correct Savings Gap income value on Dashboard after onboarding

**Bug ref:** BUG-28 (UI side)
**Priority:** P1
**Type:** UX/UI
**Files touched:** `app/(tabs)/index.tsx` (Dashboard screen) or whichever file renders Savings Gap

### What's broken
The Savings Gap widget always shows ₱0 income because `getSavingsGap` returns `monthlySalary: null` (hardcoded in `rowToProfile`). Once TASK-BE-03 fixes the data layer, the UI must display the returned income correctly without further changes — this task is to confirm no additional UI mapping is needed and to add an E2E assertion.

### Reproduction steps
1. Complete onboarding with ₱25,000 salary.
2. Open Dashboard.
3. Savings Gap income line shows ₱0 or negative gap.

### Acceptance criteria
- [ ] After TASK-DB-01 and TASK-BE-03 land, Savings Gap correctly displays ₱25,000 income.
- [ ] If income is `null` or `0`, the widget shows a placeholder or ₱0 gracefully — not a crash or NaN.

### Technical notes
Locate the Savings Gap rendering component. Confirm it reads from `getSavingsGap` result and does not independently hardcode `0`. No new UI code expected — this is a verification task.

### Dependencies
Blocked by TASK-DB-01 and TASK-BE-03.
