---
name: task-assign
description: Calls the task-dispatcher agent to read a task file (or a tasks directory) and route each task to the correct specialized agent.
triggers:
  - /task-assign
---

Launch the `task-dispatcher` agent with the following prompt:

---

**Task: Read and route tasks to the correct specialized agent**

**Input:**
{{args or "docs/tasks/ — scan for the most recently modified task batch directory (e.g. beta-test-2026-11-5-12-30/) and process all TASKS-*.md files inside it"}}

**Agent roster for this project:**

| Agent | Handles |
|-------|---------|
| `rn-frontend-engineer` | React Native screens, components, navigation, UI/UX, Expo APIs |
| `backend-api-engineer` | Business logic, hooks, Supabase queries, auth flows, sync |
| `db-schema-engineer` | Schema changes, migrations, indexes, seed data, Drizzle ORM |
| `devops-pipeline-engineer` | Build config, CI/CD, env vars, push notifications, signing |
| `mobile-beta-tester` | Testing, regression checks, smoke tests |
| `bug-task-decomposer` | Converting bug reports into structured tasks |

**What to do:**

1. Read the input — either a single task file or all `TASKS-*.md` files in the target directory. If a `MANIFEST.md` exists, read it first for wave order and file-conflict notes.
2. For each task entry, identify its discipline (FE / BE / DB / DevOps) and map it to the correct agent above.
3. Respect wave order from the manifest: dispatch Wave 0 tasks first and wait for completion before Wave 1; tasks within the same wave with no file conflicts can run in parallel.
4. For each task, invoke the target agent via the Agent tool with:
   - The full task body (description, reproduction steps, acceptance criteria, technical notes)
   - Exact file paths the task touches
   - Any dependency tasks that must already be complete
   - Clear instruction to edit the files and report back when done
5. After all dispatches complete, output a **Task Dispatch Report**:

```
## Task Dispatch Report — [date]

| Task ID | Agent | Status | File conflicts | Notes |
|---------|-------|--------|---------------|-------|
| TASK-FE-01 | rn-frontend-engineer | Dispatched | none | Wave 1 |
| TASK-DB-01 | db-schema-engineer | Dispatched | stubs.ts conflict w/ TASK-BE-03 | Wave 1 — sequenced |
...

### Flagged / unroutable:
- [any tasks with no matching agent]

### Execution sequence:
- [wave breakdown]
```
