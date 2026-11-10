# TASKS-BE — Beta Test 2026-11-10 12:05
**Target agent:** `backend-api-engineer`
**Source report:** `docs/bugs/bug-report-2026-11-10-1204.md`

---

## TASK-BE-01: Add PRD coverage — Recurring Expenses push reminder and mark-as-paid (Feature 4)

**Bug ref:** PRD gap — Feature 4
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** `lib/db/stubs.ts`, `db/queries/recurringRules.ts`

### What's broken
No E2E or integration path exercises the Recurring Expenses push reminder or the mark-as-paid action. The PRD requires that recurring bill reminders fire via push notification and that a user can mark a rule as paid, advancing the next-due date. The business logic paths exist (from prior batches) but have never been validated end-to-end in a test session.

### Reproduction steps
1. Create a recurring expense rule with a due date of today.
2. Trigger the scheduler / background task that sends reminders.
3. Observe whether a push notification is dispatched.
4. Tap "Mark as paid" — observe whether `nextDueDate` advances correctly.

### Acceptance criteria
- [ ] `advanceNextDueDate` correctly advances the due date by the rule's interval using local date (not `toISOString().slice(0,10)` — UTC offset fix from Batch 3/4 must be in place).
- [ ] `getRulesDueWithin` returns rules due within the cutoff window using the JS-side local date fix.
- [ ] A test or manual verification confirms a rule marked as paid advances its `nextDueDate` by the correct number of days/months.
- [ ] No regression on existing recurring rule queries.

### Technical notes
Both `lib/db/stubs.ts` and `db/queries/recurringRules.ts` have duplicate implementations of `advanceNextDueDate` and `getRulesDueWithin`. The UTC-offset fix (Batch 3 BUG-29, Batch 4 BUG-31/BUG-32) must be verified in both files — `db/queries/recurringRules.ts`'s SQLite `date('now',...)` path is safe; only the JS-side cutoff in `stubs.ts` is at risk. The `paymentMethod` enum fix (BUG-30, Batch 4) must also be confirmed present before testing recurring rules that carry a payment method.

### Dependencies
None — parallel-safe. Informs TASK-DEVOPS-02 (push notification testing).

---

## TASK-BE-02: Investigate and add coverage for Offline + Cloud Sync flows (Features 8/9)

**Bug ref:** PRD gap — Features 8/9
**Priority:** P2
**Type:** INVESTIGATION
**Files touched:** Determined by investigation (likely `lib/sync/`, hooks, or Supabase integration layer)

### What's broken
Offline queue behavior, sync-on-reconnect, and the sync status indicator are entirely untested. The PRD requires that expenses created offline are queued and synced when connectivity returns, and that a UI indicator reflects sync state. No flow exercises a network-off scenario.

### Reproduction steps
1. Disable network on the emulator.
2. Add an expense.
3. Re-enable network.
4. Observe whether the expense syncs to Supabase and whether a UI status indicator reflects the transition.

### Acceptance criteria
- [ ] An expense created offline appears in the local DB immediately.
- [ ] On reconnect, the expense is pushed to Supabase without user action.
- [ ] The sync status indicator (if implemented) transitions from "pending" to "synced".
- [ ] No duplicate entries are created if the user syncs twice.

### Technical notes
This is an investigation task. Begin by locating the offline queue implementation (search for `offlineQueue`, `syncQueue`, or Supabase `upsert`/conflict resolution patterns). If the feature is not yet implemented, produce a gap report rather than a fix. Do not build the feature within this task — scope is confirm-or-document.

### Dependencies
None — parallel-safe.
