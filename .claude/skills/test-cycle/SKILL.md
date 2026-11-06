---
name: test-cycle
description: Run the full test → bug-report → decompose → assign loop once. Use /loop to repeat.
triggers:
  - /test-cycle
---

Run the following skills in sequence, waiting for each to fully complete before starting the next:

**Step 1 — Test + report**
Invoke the `/mobile-test` skill. It will run the mobile-beta-tester agent and automatically call `/bug-report` at the end, writing a file to `docs/bugs/`.

**Step 2 — Decompose**
Invoke the `/bug-decompose` skill with the path of the bug report file just written (from Step 1). It will produce `docs/tasks/<batch>/TASKS-*.md` files.

**Step 3 — Assign**
Invoke the `/task-assign` skill with the task batch directory created in Step 2. It will dispatch each task to the correct agent.

**Step 4 — Summary**
After all three steps complete, output one line:

> `test-cycle done — N bugs found → M tasks created → assigned to agents`

**If args are provided**, pass them through to `/mobile-test` (e.g. a specific screen or flow to focus on).

**Note:** To run this on a schedule, use `/loop 90m /test-cycle`. To run continuously without a fixed interval, use `/loop /test-cycle`.
