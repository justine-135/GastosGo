---
name: bug-decompose
description: Calls the bug-task-decomposer agent to read a bug report and produce independent, discipline-scoped task files ready for parallel agent execution.
triggers:
  - /bug-decompose
---

Launch the `bug-task-decomposer` agent with the following prompt:

---

**Task: Decompose a bug report into parallel-safe task files**

**Bug report to analyze:**
{{args or "docs/bugs/ — scan for the most recently modified .md file in that directory"}}

**Output directory:** `docs/tasks/beta-test-{{current date as YYYY-M-D}}-{{current time as H-M}}/`
Example: `docs/tasks/beta-test-2026-11-5-12-30/`

**What to produce — one file per discipline, plus a manifest:**

| File | Target agent | Scope |
|------|-------------|-------|
| `TASKS-FE.md` | `rn-frontend-engineer` | React Native screens, components, navigation, UI states, Expo APIs |
| `TASKS-BE.md` | `backend-api-engineer` | Business logic, hooks, API calls, Supabase queries, auth, sync |
| `TASKS-DB.md` | `db-schema-engineer` | Schema changes, migrations, indexes, seed data, Drizzle queries |
| `TASKS-DEVOPS.md` | `devops-pipeline-engineer` | Build config, CI, env vars, notifications, push tokens, permissions |
| `MANIFEST.md` | (orchestrator) | Wave plan, file-conflict map, discipline summary |

**Rules for each task entry:**

```
## TASK-[DISCIPLINE]-[NN]: [Verb-first title]

**Bug ref:** BUG-XX  
**Priority:** P0 | P1 | P2 | P3  
**Type:** BUG | INVESTIGATION | REGRESSION | PERFORMANCE | SECURITY | UX/UI | DATA  
**Files touched:** `path/to/file.ts`, ...

### What's broken
[One paragraph: observed vs expected behavior]

### Reproduction steps
1. …

### Acceptance criteria
- [ ] …

### Technical notes
[Stack trace snippets, suspected root cause, related code]

### Dependencies
[Other TASK IDs this must follow, or "none — parallel-safe"]
```

**Independence rules (critical):**
- Each task must list every file it touches under "Files touched".
- If two tasks touch the same file, mark BOTH with `⚠️ file conflict — assign to same agent or sequence after TASK-X` in their Dependencies field.
- Group tasks into waves inside `MANIFEST.md`: Wave 0 (blockers), Wave 1 (parallel), Wave 2+ (depend on Wave 1).
- Never split a single atomic fix across two discipline files just to fill a category — assign it to whichever discipline owns that file.

**MANIFEST.md must include:**
1. Source report path and date
2. Wave table (wave → task IDs → bugs covered → discipline → files)
3. File-conflict map (file → task IDs that touch it)
4. Summary table: tasks per discipline per priority

Write all files using the Write tool. Report the output directory path when done.
