Status: ready-for-agent

# DX Guardrails

## Problem Statement

The app failed to start because two packages (`expo-linking`, `react-native-worklets`) were listed in `package.json` but absent from `node_modules`. Nothing caught the drift before an agent attempted to run the app. The diagnosis took multiple full bundle attempts, each surfacing one missing package at a time. `npx expo install --check` returned a false "up to date" result throughout, misleading the agent further. No CI pipeline exists to catch this class of error on push.

## Solution

Three guardrails that together prevent missing-dependency failures from reaching a running agent or a merged PR:

1. A pre-commit hook that aborts if `package.json` is newer than `node_modules/.package-lock.json`, and runs `tsc --noEmit` to catch type errors before commit.
2. A `docs/agents/dependency-checks.md` file — pointed to from `CLAUDE.md` — that tells agents not to trust `npx expo install --check` and shows the correct diagnostic.
3. A GitHub Actions CI workflow that runs `npm ci`, bundles the Android app, and runs the Jest test suite on every push and pull request.

## User Stories

1. As a developer, I want the pre-commit hook to block my commit when `package.json` has changed but `npm install` has not been run, so that I never accidentally commit a state that won't bundle.
2. As a developer, I want the pre-commit hook to run `tsc --noEmit` before every commit, so that type errors are caught locally before they reach CI.
3. As a developer, I want a clear error message from the hook telling me exactly what to run (`npm install`), so that I am not left guessing.
4. As a developer, I want the hook to be fast (under 10 seconds), so that I am not tempted to disable it.
5. As a coding agent, I want a `docs/agents/dependency-checks.md` reference in context, so that I do not waste bundle attempts discovering missing packages one at a time.
6. As a coding agent, I want the dependency doc to tell me that `npx expo install --check` does not verify `node_modules` presence, so that I do not follow a misleading "up to date" result.
7. As a coding agent, I want the dependency doc to show the correct diagnostic command (`ls node_modules/<pkg>`), so that I can verify package presence in one step.
8. As a developer, I want `CLAUDE.md` to point to the dependency-checks doc, so that agents load it without searching.
9. As a developer, I want CI to run `npm ci` on every push and pull request, so that lockfile drift is caught before merge.
10. As a developer, I want CI to bundle the Android app (`npx expo export --platform android`), so that Metro bundler errors are caught on every PR.
11. As a developer, I want CI to run `npm test`, so that Jest regressions are caught on every PR.
12. As a developer, I want CI to fail fast and report a clear error when `npm ci` finds the lockfile out of sync with `package.json`, so that the fix is obvious.
13. As a developer, I want the CI job to use `npm ci` (not `npm install`), so that the lockfile is treated as authoritative and undeclared installs are rejected.

## Implementation Decisions

- **Pre-commit hook** lives at `.git/hooks/pre-commit` (plain shell, no Husky dependency). It compares the modification time of `package.json` against `node_modules/.package-lock.json`; if `package.json` is newer it prints a message and exits 1. After the timestamp check it runs `npx tsc --noEmit`; any type error exits 1.
- **Hook is not committed to the repo** — `.git/hooks/` is not tracked. A `scripts/install-hooks.sh` script is provided and documented in `CLAUDE.md` so any developer (or agent doing a fresh clone) can wire it in one command.
- **`docs/agents/dependency-checks.md`** is a short reference doc. It states: (a) `npx expo install --check` checks version compatibility, not `node_modules` presence — do not use it to verify that packages are installed; (b) the correct check is `ls node_modules/<pkg>`; (c) if packages are missing, run `npm install`.
- **`CLAUDE.md`** gains one pointer line under a new "Dependency checks" section: `See docs/agents/dependency-checks.md before diagnosing missing-module errors.`
- **CI workflow** at `.github/workflows/ci.yml` runs on `push` and `pull_request`. Single job, Ubuntu latest, Node 22. Steps: checkout → setup-node with cache → `npm ci` → `npx expo export --platform android` → `npm test`.
- Node version in CI is pinned to `22` (matches the project's current engine) using `actions/setup-node@v4`.

## Testing Decisions

- Good tests here are integration tests on the hook script itself: run `.git/hooks/pre-commit` in a controlled state and assert the exit code and stderr message.
- **Seam**: the hook script is a plain shell script — it can be executed directly with `bash .git/hooks/pre-commit` after manipulating `package.json` and `node_modules/.package-lock.json` timestamps with `touch`.
- Two cases to cover: (1) `package.json` newer → exit 1 with the "run npm install" message; (2) timestamps in sync, no type errors → exit 0.
- No existing test prior art for shell scripts in this repo; a small `__tests__/hooks/pre-commit.test.ts` using `child_process.execSync` is the natural fit given Jest is already configured.
- The CI workflow is not unit-tested; correctness is verified by the first successful green run.

## Out of Scope

- Husky or lint-staged integration.
- Running the full test suite or bundle check in the pre-commit hook (slow hooks get disabled).
- Windows-native hook support (the hook is a POSIX shell script; Windows developers use Git Bash or WSL, which both support it).
- Automated hook installation on `npm install` (a `prepare` script would do this, but it adds friction for CI where hooks should not run).
- Fixing the underlying reason `package.json` drifted from `node_modules` in the first place.

## Further Notes

The false negative from `npx expo install --check` is a known Expo CLI behaviour: the command checks whether installed versions satisfy the version constraints in `package.json`, not whether the packages are physically present in `node_modules`. This distinction should be preserved in the dependency-checks doc so future agents don't rediscover it.
