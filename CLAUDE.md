## Code style

- No inline comments mixed with code. If a section needs explanation, create a file under `docs/` explaining it — keep code comment-free.
- Use descriptive variable names. Avoid vague names like `data`, `item`, `val`, `temp`, `x`, or single-letter identifiers outside loop indices.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.
