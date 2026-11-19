# 08: Maestro E2E + CI gate

**What to build:** The critical paths are protected by end-to-end tests: Maestro flows cover onboarding and add-expense, and they run as a PR gate on EAS so regressions are caught before merge.

**Blocked by:** 02

**Status:** done

- [ ] `.maestro/` flows re-created from scratch: onboarding and add-expense at minimum (reuse pre-wipe findings)
- [ ] `.eas/workflows/` job on `pull_request`: build with the `e2e-test` profile, then run the Maestro flows against the artifact
- [ ] Local runs iterate against Android (Windows-native Maestro CLI); iPhone flows run in CI on EAS macOS runners
