---
name: mobile-test
description: Launch the mobile-beta-tester agent to run a full test session on the app.
triggers:
  - /mobile-test
---

Launch the `mobile-beta-tester` agent to test the app.

Pass any arguments the user provided (e.g. a specific screen, flow, or build note) as context in the agent prompt. If no arguments were given, request a full smoke test covering all critical flows.

Prompt template:

> Run a test session on the GastosGo app. {{args or "Perform a full smoke test covering all critical user flows: onboarding, lock/biometrics, adding expenses, recurring rules, budgets, insights, and settings."}} Report all findings using the standard bug report format and end with a Test Summary.
