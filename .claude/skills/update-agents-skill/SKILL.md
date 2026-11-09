---
name: update-agents-skill
description: Sync all skills from .agents/skills into .claude/skills (non-destructive — never deletes .claude/skills-only skills).
triggers:
  - /update-agents-skill
---

Run:

```powershell
robocopy ".agents\skills" ".claude\skills" /E
```

Report how many files were copied/updated. Robocopy exit codes 0–7 are success (not errors).
