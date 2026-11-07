---
name: project-beta-batch5
description: Beta test batch 5 (2026-11-06) task wave plan and agent routing decisions
metadata:
  type: project
---

Batch 5 task set from `docs/tasks/beta-test-2026-11-6-14-0/`. Wave structure:

- **Wave 0 (blocker):** TASK-FE-01 — tab nav fix → `rn-frontend-engineer`
- **Wave 1 (parallel after Wave 0):**
  - TASK-FE-02 (04-navigation.yaml assertions) → `rn-frontend-engineer`
  - TASK-FE-03 (auth overlay), TASK-FE-05 (LogBox), TASK-DEVOPS-01 (LogBox env flag) → same `rn-frontend-engineer` agent (all three touch `app/_layout.tsx`)
  - TASK-BE-01 (PRD feature business logic audit) → `backend-api-engineer`
- **Wave 2 (after TASK-FE-04):** TASK-BE-02 (03-add-expense.yaml scroll) → `backend-api-engineer`

**Key routing rule:** When multiple Wave 1 tasks share a file (`app/_layout.tsx`), route them to the same agent to avoid merge conflicts.

**DB agent:** No tasks this batch — all schema gaps confirmed closed in commits 379bcf2 and 90189a2.

**BUG-03 reclassified:** payment method field IS in JSX (add-expense.tsx lines 241–256), just below the fold. TASK-FE-04 is an investigation, not a fix.

**Why:** Wave gating prevents wasted work — Wave 1 tasks on Budgets/Insights screens are only meaningful after tab nav is fixed.

**How to apply:** Always read MANIFEST.md first for wave order and file-conflict map before dispatching any batch.
