---
name: bug-report
description: Write a bug report MD file to docs/bugs/ summarizing bugs found during the last test session.
triggers:
  - /bug-report
---

Generate a bug report from the most recent test session findings and write it to `docs/bugs/`.

**Filename format:** `bug-report-YYYY-MM-DD-HHmm.md` (use today's date and current 24h hour+minute).

**File content format:**

```md
# Bug Report — YYYY-MM-DD HH:mm

**Session:** <brief description, e.g. "Full smoke test" or the args passed to /mobile-test>

## Bugs Found

| # | Screen / Flow | Severity | Description | Repro Steps |
|---|---------------|----------|-------------|-------------|
| 1 | ...           | High/Med/Low | ... | ... |

## Notes

<any patterns, blockers, or flaky behaviour worth calling out>

## Status

- [ ] Triaged
- [ ] Assigned
```

Severity guide: **High** = crash or data loss, **Med** = broken flow, **Low** = cosmetic or minor UX.

If no bugs were found, write the file anyway with "No bugs found this session." under ## Bugs Found.

Write the file using the Write tool, then print the file path so the user can find it.
