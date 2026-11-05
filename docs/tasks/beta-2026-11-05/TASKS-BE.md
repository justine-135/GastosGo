# GastosGo — Backend Tasks
**Generated from:** docs/bugs/bugs.md  
**Date:** 2026-11-05  
**Assignee agent:** backend-api-engineer

---

## TASK-BE-01 — Fix `deleteExpense` sync queue payload passing date instead of ID
**Bug ref:** BUG-05  
**Severity:** High  
**File:** `hooks/useExpenses.ts:77`  
**What to do:** Change `enqueue('delete', 'expenses', { id: date })` to `enqueue('delete', 'expenses', { id })` so the sync queue receives the expense's row ID, not the ISO date string. Grep all other `enqueue` call sites in `hooks/` to confirm no other payload passes the wrong field.  
**Acceptance criteria:**
- `enqueue('delete', 'expenses', ...)` receives `{ id: <expense UUID/integer> }` not an ISO date string.
- No other `enqueue` call in the codebase passes a date value as `id`.
- When sync runs, the correct remote row is targeted for deletion and no "row not found" errors occur.

---

## TASK-BE-02 — Replace `hasCloudSession` stub with real `supabase.auth.getSession()` call
**Bug ref:** BUG-12  
**Severity:** Medium  
**File:** `app/onboarding/index.tsx:10`  
**What to do:** Remove `const hasCloudSession = false; // stub` and replace it with a call to `supabase.auth.getSession()` to determine whether an authenticated session exists. Expose the result to the UI so the "Restore from cloud" button is shown conditionally. The comment `⚠️ BACKEND REQUIRED (BE-04)` should be removed once this is wired.  
**Acceptance criteria:**
- `supabase.auth.getSession()` is called on mount (not a hardcoded constant).
- "Restore from cloud" button is visible when `session` is non-null.
- "Restore from cloud" button is hidden when `session` is null.
- No hardcoded `false` remains for `hasCloudSession`.
- The `⚠️ BACKEND REQUIRED` stub comment is removed.
