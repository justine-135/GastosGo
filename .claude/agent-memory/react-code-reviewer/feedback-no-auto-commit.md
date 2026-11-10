---
name: feedback-no-auto-commit
description: Do not commit after edits in GastosGo; leave staging and committing to the user
metadata:
  type: feedback
---

Never commit changes automatically. Leave staging/committing to the user.

**Why:** Carried over from the user's auto-memory (`feedback-no-auto-commit`); the user manages their own git history.

**How to apply:** Make edits and report them, but stop short of `git add`/`git commit` unless the user explicitly asks. This reviewer agent is read-only anyway, but the rule holds if ever asked to apply fixes.
