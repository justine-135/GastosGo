---
name: tdd
description: TDD workflow for new features, bug fixes, and refactors. Enforces Red-Green-Refactor with 80%+ coverage across unit, integration, and E2E layers.
triggers:
  - /tdd
---

# TDD Workflow

**Cycle:** Red → Green → Refactor. Write the failing test first. Never write implementation without a failing test.

---

## Before you start

1. Read the files the task touches. List the layers it reaches: pure logic, DB queries, hooks, UI, navigation.
2. For a **bug fix**: reproduce it in a test first. If the test passes before your fix, the test is wrong.
3. For a **refactor**: lock existing behavior in tests before touching a line of production code.
4. Check `e2e/` for existing Maestro flows that cover the affected screen — extend them rather than writing a new one.

---

## Layer map for this project

| What you're testing | Tool | Location |
|---|---|---|
| Pure utils / formatters | Jest unit | `__tests__/utils/` |
| DB query functions (`db/queries/`) | Jest + in-memory SQLite | `__tests__/db/` |
| Hooks (`hooks/`) | Jest + React Testing Library | `__tests__/hooks/` |
| Supabase sync / auth (`lib/`) | Jest with mocked `supabase` client | `__tests__/lib/` |
| Full screen flows | Maestro | `e2e/flows/` |

---

## Red-Green-Refactor steps

### 1. Red — write the failing test

- Name it `<thing-under-test>.test.ts` (or `.test.tsx` for components).
- One `describe` per module, one `it` per behavior.
- Assert the exact output or state change. Run it: **it must fail.**
- If it passes without implementation, your test is testing nothing — fix it.

### 2. Green — minimum code to pass

- Write only what makes the test pass. No extras.
- Run all tests in the affected file: `npx jest <file> --no-coverage`.
- If you broke an existing test, fix it now — don't proceed with a red suite.

### 3. Refactor — clean without changing behavior

- Tests stay green throughout. If one goes red, undo and try again.
- Remove duplication. Rename for clarity. No new logic here.

---

## Coverage gate: 80%

After implementing, run:

```bash
npx jest --coverage --collectCoverageFrom="<changed files glob>"
```

If coverage is below 80% on changed files, add tests for the uncovered branches before marking the task done.

Skipped lines: generated migration files, `*.config.*`, `shims/`, `app.json`.

---

## E2E — when to add a Maestro flow

Add or extend a Maestro flow in `e2e/flows/` when:
- A new screen or modal is added.
- A multi-step user flow changes (onboarding, add expense, PIN lock).
- A bug was caused by navigation or async state that unit tests cannot catch.

Keep flows short: one happy path per file, one edge case file per screen.

---

## Done checklist

- [ ] Failing test written and confirmed red before any implementation
- [ ] All new logic covered by at least one unit or integration test
- [ ] `npx jest --coverage` shows ≥ 80% on changed files
- [ ] No existing tests broken
- [ ] E2E flow added/extended if a screen or user flow changed
- [ ] Bug fix: original reproduction test passes; regressed test present

---

## Quick commands

```bash
# Run one file in watch mode
npx jest __tests__/db/expenses.test.ts --watch

# Coverage for changed files only
npx jest --coverage --testPathPattern="__tests__"

# Run Maestro E2E flow
maestro test e2e/flows/add-expense.yaml
```
