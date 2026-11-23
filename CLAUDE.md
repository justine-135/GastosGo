## Git workflow

- `dev` is the development branch. `master` is production.
- At the start of every session, before any file change: `git fetch origin && git checkout -b <type>/<description> origin/dev`. One branch per session.
- Branch naming: `feat/<description>`, `fix/<description>`, `chore/<description>`.
- After pushing, open a PR targeting `dev`. CI must pass before the PR merges (auto-merge is enabled on `dev`).
- Never push directly to `dev` or `master` — PRs only.

## Code style

- No inline comments mixed with code. If a section needs explanation, create a file under `docs/` explaining it — keep code comment-free.
- Use descriptive variable names. Avoid vague names like `data`, `item`, `val`, `temp`, `x`, or single-letter identifiers outside loop indices.

## Dependency checks

Before diagnosing missing-module errors, see `docs/agents/dependency-checks.md`.

## Git hooks

Run `sh scripts/install-hooks.sh` after a fresh clone to wire the pre-commit hook.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.
