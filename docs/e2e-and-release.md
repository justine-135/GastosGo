# GastosGo — E2E Testing & Release Workflow

Research notes grounded in primary sources (Expo, Maestro, EAS, Supabase official docs). **iPhone-first, Android-ready**, Expo-managed (SDK 58 / RN 0.88 / React 19), dev on Windows 11 with no Mac. Companion to [`tech-stack.md`](tech-stack.md).

> Repo state at time of writing: no `.maestro/`, no `eas.json`, no `.github/workflows/` yet. This doc defines the conventions to create. Maestro was **previously wired here** (3/4 flows passing) but the flows were removed in the fresh-implementation wipe — they must be re-created. The recommendation below stands.

---

## 1. E2E testing: Maestro vs Detox

### Recommendation: **Maestro.** It is Expo's own official recommendation, and it's already in use here.

Expo's testing docs state directly: *"For UI testing, we recommend end-to-end tests instead of snapshot unit tests"* and point to a dedicated guide, *E2E tests with Maestro on Expo Workflows* ([docs.expo.dev/develop/unit-testing](https://docs.expo.dev/develop/unit-testing/), [docs.expo.dev/eas/workflows/examples/e2e-tests](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)). Expo's E2E reference and Workflows example pages name **only Maestro** — Detox is not mentioned in current Expo E2E docs ([docs.expo.dev/build-reference/e2e-tests](https://docs.expo.dev/build-reference/e2e-tests/)).

| Criterion | **Maestro** | **Detox** |
|---|---|---|
| Expo's official stance | **Recommended**; the only E2E tool in Expo's E2E guides ([unit-testing](https://docs.expo.dev/develop/unit-testing/), [e2e-tests](https://docs.expo.dev/build-reference/e2e-tests/)) | Not referenced in current Expo E2E docs |
| Build type needed | Built app binary — **`.apk` (Android) / `.app` (iOS)** — not Expo Go ([build-reference/e2e-tests](https://docs.expo.dev/build-reference/e2e-tests/)) | Also needs a built binary, not Expo Go (Detox requires a custom/dev build) |
| Windows 11 support (no Mac) | **Yes.** Maestro docs: *"Maestro CLI runs natively on Windows; WSL is not required"* — needs the Windows release on PATH + Java 17+ ([docs.maestro.dev/.../quickstart](https://docs.maestro.dev/get-started/quickstart.md)). WSL is supported but discouraged. Maestro Studio also ships a native Windows `.exe` ([installing-maestro](https://docs.maestro.dev/getting-started/installing-maestro)) | Historically painful on Windows; tied to native build toolchains. Not endorsed by Expo for this stack |
| CI with EAS | **First-class.** EAS Workflows has a built-in `maestro` job type; the Expo example runs a build job then a maestro job on `pull_request` ([eas/workflows/examples/e2e-tests](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)) | No native EAS Workflows job type; would be hand-wired |
| Maintenance burden | Flows are YAML files under `.maestro/`; low ceremony, referenced by `flow_path` ([e2e-tests](https://docs.expo.dev/build-reference/e2e-tests/)) | More config; must track RN/native version compatibility |

**Note on the Mac question for E2E:** Maestro runs the *tests* on Windows fine against an **Android** emulator. For **iOS** E2E you need the `.app` binary + an iOS Simulator, which only exists on macOS. The practical answer on Windows-only hardware: run iOS E2E **in CI on EAS Workflows' macOS runners** (the Expo example builds with a simulator profile and runs Maestro there), and iterate locally against Android. This matches "iPhone-first, Android-ready" without needing a local Mac.

**Bottom line:** stay on Maestro — it's Expo-recommended, Windows-native for the CLI, CI-native on EAS, lower-maintenance than Detox, and was already proven here (3/4 flows passing before the wipe) — re-create the flows rather than migrate to Detox.

### Conventions to create
- `.maestro/` at repo root holding one YAML flow per file (e.g. `01-launch.yaml`, `02-onboarding.yaml`, `03-add-expense.yaml`) — to be re-created. `02-onboarding` was the historically failing flow; re-author it and confirm it passes this time.

---

## 2. Production story / release workflow (EAS pipeline)

All from Expo primary docs. Pipeline: **Build → (Update for JS) / Submit → store**, with E2E as a CI gate.

### EAS Build — iOS without a Mac
EAS Build compiles the app in the cloud: *"iOS builds run on macOS runners hosted in Expo's macOS cloud"* ([docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/)). So you build and ship an iPhone app from Windows 11; no local Mac. (Local `eas build --local` exists but needs a matching OS — not applicable to iOS on Windows.) ([build/setup](https://docs.expo.dev/build/setup/))

### Build profiles (`eas.json`)
Default three profiles ([docs.expo.dev/build/eas-json](https://docs.expo.dev/build/eas-json/)):
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal" },
    "production":  {}
  }
}
```
- **development** — debug build with `expo-dev-client`; internal distribution for fast iteration.
- **preview** — no dev tools; production-like, internal distribution for team/stakeholder testing (Android ships `.apk` not `.aab`).
- **production** — store build. *"Production builds must be installed through their respective app stores. They cannot be installed directly on your Android Emulator or device, or iOS Simulator or device."* ([eas-json](https://docs.expo.dev/build/eas-json/))

Add a fourth **`e2e-test`** profile for the CI gate (see §2 E2E), per Expo's example:
```json
"e2e-test": {
  "withoutCredentials": true,
  "ios": { "simulator": true },
  "android": { "buildType": "apk" }
}
```
This produces an `.app` (iOS Simulator) and an `.apk` (Android) ([build-reference/e2e-tests](https://docs.expo.dev/build-reference/e2e-tests/)).

### EAS Submit — to the stores
*"A submission is one upload of a build to Google Play Console or App Store Connect. `eas submit` creates one submission for each platform."* iOS: uploads the `.ipa` to App Store Connect, where it appears in TestFlight after ~10–15 min processing. Android: uploads the `.aab` to Google Play Console into the chosen track (internal/alpha/beta/production). Submit uploads the binary only — **store metadata and screenshots are done in each console** ([docs.expo.dev/submit/introduction](https://docs.expo.dev/submit/introduction/)).

### EAS Update — OTA JS updates and the runtime-version rule
EAS Update swaps the JS/asset layer over-the-air without a store resubmission. A build has two layers: an immutable **native** layer and a replaceable **update** layer. The compatibility rule: *"Runtime versions are a property that guarantees compatibility between a build's native code and an update"* — an update only runs if its runtime version **matches** the build's. Critically: *"any time native code is updated, we're required to make a new build before publishing an update."* So JS-only fixes → push an update; adding/removing a native module (e.g. `expo-camera`) → bump the runtime version and ship a new build. Expo recommends the **`fingerprint`** runtime-version policy to track native changes automatically ([docs.expo.dev/eas-update/runtime-versions](https://docs.expo.dev/eas-update/runtime-versions/)).

### Where E2E fits — the CI gate
Use **EAS Workflows** (Expo's native CI) for the gate. Expo's example defines a workflow triggered on pull requests — `"on": { "pull_request": { "branches": ["*"] } }` — that runs a **build** job with the `e2e-test` profile, then a **maestro** job that runs the `.maestro` flows against that build artifact ([docs.expo.dev/eas/workflows/examples/e2e-tests](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)). GitHub Actions is a valid alternative but you'd hand-wire the build + Maestro steps; EAS Workflows has the `maestro` job type built in, so prefer it here.

### Conventions to create
- `eas.json` with `development` / `preview` / `production` / `e2e-test` profiles + a `submit` config.
- `.eas/workflows/` (EAS Workflows YAML) for the PR E2E gate, over `.github/workflows/`, to use the native `maestro` job.
- `runtimeVersion: { "policy": "fingerprint" }` in `app.json` so OTA/native compatibility is tracked automatically.

---

## Sources
- Expo testing / E2E recommendation: [develop/unit-testing](https://docs.expo.dev/develop/unit-testing/) · [build-reference/e2e-tests](https://docs.expo.dev/build-reference/e2e-tests/) · [eas/workflows/examples/e2e-tests](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
- Maestro: [installing-maestro](https://docs.maestro.dev/getting-started/installing-maestro) · [quickstart](https://docs.maestro.dev/get-started/quickstart.md)
- EAS Build: [build/introduction](https://docs.expo.dev/build/introduction/) · [build/setup](https://docs.expo.dev/build/setup/) · [build/eas-json](https://docs.expo.dev/build/eas-json/)
- EAS Submit: [submit/introduction](https://docs.expo.dev/submit/introduction/)
- EAS Update: [eas-update/runtime-versions](https://docs.expo.dev/eas-update/runtime-versions/)
</content>
</invoke>
