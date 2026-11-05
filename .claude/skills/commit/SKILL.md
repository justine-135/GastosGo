---
name: commit
description: Stage all changes and commit with a concise, auto-generated message describing what was done.
triggers:
  - /commit
---

Run the following steps:

1. Run `git status` to see what changed.
2. Run `git diff --staged` and `git diff` to understand the changes.
3. Run `git add .` to stage everything.
4. Write a commit message: one short imperative line (≤72 chars) that says *what* changed. No body, no attribution line. Examples: "Add biometrics onboarding screen", "Fix lock screen crash on Android".
5. Run `git commit -m "<message>"`.
6. Report the commit hash and message in one line.
