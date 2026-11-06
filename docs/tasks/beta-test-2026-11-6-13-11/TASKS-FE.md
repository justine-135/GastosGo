# TASKS-FE — beta-test-2026-11-6-13-11

Target agent: `rn-frontend-engineer`
Source report: `docs/bugs/bug-report-2026-11-06-1311.md`

---

No frontend-owned bugs in this batch. BUG-30, BUG-31, and BUG-32 are all data-layer or business-logic defects. The UI already writes the correct title-case `PaymentMethod` values (`GCash`, `Cash`, `Card`, `Others`) — the mismatch is in the schema enum, not the UI. No screen, component, navigation, or Expo API change is required.

**Post-fix validation (not a task, but a checklist for the FE agent to run after DB-01 and BE-01-03 land):**
- Recurring rule Add/Edit form: select each payment method and confirm the value round-trips correctly from the DB without visual glitch.
- Dashboard "Bills Due (7d)" card: verify rules due in exactly 7 days appear at any time of day (use a test rule or mock clock).
- Mark-as-Paid flow: confirm `nextDueDate` displayed after marking paid matches the expected local date.
