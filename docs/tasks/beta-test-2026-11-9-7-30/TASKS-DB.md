# Database Tasks — Beta Test 2026-11-09 07:30

Target agent: `db-schema-engineer`

---

No schema changes are required for this bug batch.

All three bugs (BUG-01, BUG-02, BUG-03) are confined to the UI layer, Maestro E2E YAML, or application business logic. The `expenses` table already has a nullable `merchant` column; `notifications.tsx` has no DB footprint; the Metro banner issue is a test-environment artifact.

If TASK-BE-01 investigation reveals that the `merchant` column is missing or mis-typed in the schema, a follow-up DB task should be filed. No pre-emptive migration is warranted.
