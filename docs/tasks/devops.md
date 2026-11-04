# GastosGo — DevOps Tasks (Expo SDK 52 + EAS Build + Infra)

Layer: **DO**
All tasks are independent within this layer. Complete DO-01 first (project scaffold) — all other DO tasks can then run in parallel.

---

## DO-01: Expo SDK 52 Project Scaffold

**Title:** Initialize Expo SDK 52 project with Expo Router and TypeScript

**Description:**
Bootstrap the GastosGo project using `create-expo-app` with the `tabs` template and SDK 52. Configure `app.json` with the app name, slug, bundle identifiers, and version. Set up the `tsconfig.json` with strict mode and path aliases matching the folder structure in the PRD. Commit the initial scaffold as the repo baseline.

**Acceptance Criteria:**
- [ ] `create-expo-app gastosgo --template tabs` (SDK 52) runs successfully
- [ ] `app.json`: `name: "GastosGo"`, `slug: "gastosgo"`, `ios.bundleIdentifier: "com.gastosgo.app"`, `android.package: "com.gastosgo.app"`, `version: "1.0.0"`, `sdkVersion: "52.0.0"`
- [ ] `tsconfig.json` has `"strict": true` and path aliases: `@/` → `./`, `@db/` → `./db/`, `@lib/` → `./lib/`, `@components/` → `./components/`, `@stores/` → `./stores/`
- [ ] `npx expo start` launches without error in Expo Go
- [ ] `.gitignore` excludes `node_modules/`, `.expo/`, `*.env.local`, `ios/`, `android/` (EAS manages native builds)
- [ ] Folder structure matches PRD: `app/`, `components/`, `features/`, `db/`, `stores/`, `hooks/`, `lib/`, `theme/`, `utils/`

**Effort:** M
**Layer Dependencies:** None

---

## DO-02: NativeWind v5 + Tailwind CSS v4 Setup

**Title:** Install and configure NativeWind v5 with Tailwind CSS v4 for Expo Router

**Description:**
Install `nativewind` and `tailwindcss` (v4). Configure `tailwind.config.ts` with the GastosGo pastel color tokens and the `content` glob covering all `app/`, `components/`, and `features/` files. Add the NativeWind Babel plugin and Metro transformer to `babel.config.js` and `metro.config.js`. Verify that a simple `className="bg-primary-500"` renders correctly on a test component.

**Acceptance Criteria:**
- [ ] `nativewind@^5` and `tailwindcss@^4` installed and listed in `package.json`
- [ ] `tailwind.config.ts` exports config with `content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"]`
- [ ] Custom color tokens defined: `primary`, `accent`, `surface`, `muted` with `DEFAULT`, `50`–`900` shades (pastel range)
- [ ] `babel.config.js` includes `nativewind/babel` plugin
- [ ] `metro.config.js` wraps with `withNativeWind(config, { input: "./global.css" })`
- [ ] `global.css` exists with `@tailwind base; @tailwind components; @tailwind utilities;`
- [ ] `npx expo start` renders a component with `className="bg-primary-200 text-accent-700"` with correct colors (verified visually in simulator)

**Effort:** M
**Layer Dependencies:** DO-01

---

## DO-03: Gluestack UI v3 Setup

**Title:** Install and configure Gluestack UI v3 with the Expo config plugin

**Description:**
Install `@gluestack-ui/themed` and its peer dependencies. Run the Gluestack CLI to generate the component config. Configure `GluestackUIProvider` in `app/_layout.tsx`. Verify that a `<Button>` and `<Input>` from Gluestack render correctly with both light and dark mode via `useColorScheme()`.

**Acceptance Criteria:**
- [ ] `@gluestack-ui/themed` and required peers installed (`@gluestack-style/react`, `react-native-svg`)
- [ ] Gluestack config generated at `components/ui/` via `npx gluestack-ui init` (or manual equivalent for SDK 52 compatibility)
- [ ] `GluestackUIProvider` in `app/_layout.tsx` receives `mode` prop from `useColorScheme()` (or the Zustand theme store once FE-01 is wired)
- [ ] `<Button>`, `<Input>`, `<Box>`, `<Text>` render without console errors in Expo Go
- [ ] Light and dark mode render correctly when device appearance is toggled
- [ ] No duplicate `react-native-svg` version conflict (check with `npx expo install --check`)

**Effort:** M
**Layer Dependencies:** DO-01, DO-02

---

## DO-04: Core Dependencies Installation

**Title:** Install all MVP dependencies: Zustand, TanStack Query, Victory Native XL, Reanimated, auth libs

**Description:**
Install the remaining MVP dependencies in one pass using `npx expo install` (respects SDK 52 peer constraints). This task exists to catch version conflicts early before feature development begins. After install, run `npx expo-doctor` to verify no incompatibilities.

**Acceptance Criteria:**
- [ ] Installed: `zustand`, `@tanstack/react-query`, `victory-native`, `react-native-reanimated@^3`, `react-native-svg`, `expo-local-authentication`, `expo-secure-store`, `expo-notifications`, `expo-crypto`, `@react-native-async-storage/async-storage`, `@supabase/supabase-js`, `drizzle-orm`, `@react-native-community/datetimepicker`, `@react-native-netinfo/netinfo`
- [ ] `npx expo-doctor` returns no errors (warnings about SDK 52 beta packages are acceptable if documented)
- [ ] `react-native-reanimated` plugin added to `babel.config.js` plugins array
- [ ] Victory Native XL requires `react-native-reanimated` and `react-native-skia` — both installed; `react-native-skia` added to Expo config plugin list in `app.json`
- [ ] `QueryClient` can be instantiated in a test file without runtime error

**Effort:** M
**Layer Dependencies:** DO-01

---

## DO-05: EAS Build Configuration

**Title:** Configure EAS Build for iOS and Android with development, preview, and production profiles

**Description:**
Create `eas.json` with three build profiles. `development` builds a development client (for use with `expo-dev-client`). `preview` produces an ad-hoc iOS IPA + APK for internal testing. `production` produces an App Store / Play Store build. Configure `app.json` with the EAS project ID.

**Acceptance Criteria:**
- [ ] `eas.json` has three profiles: `development`, `preview`, `production`
- [ ] `development`: `developmentClient: true`, `distribution: "internal"`
- [ ] `preview`: `distribution: "internal"`, iOS `simulator: false`, Android `buildType: "apk"`
- [ ] `production`: `distribution: "store"`, iOS `credentialsSource: "remote"`, Android `credentialsSource: "remote"`
- [ ] `app.json` includes `"extra": { "eas": { "projectId": "<EAS_PROJECT_ID>" } }`
- [ ] `eas build --platform all --profile preview` can be queued (actual build success requires DO-06/DO-07 certs)
- [ ] `eas.json` committed to source control; no secret keys embedded in the file

**Effort:** S
**Layer Dependencies:** DO-01

---

## DO-06: APNs Push Certificate Setup (iOS)

**Title:** Configure Apple Push Notification Service certificates via EAS Credentials

**Description:**
Use `eas credentials` to generate or upload APNs credentials for the GastosGo iOS bundle ID. EAS can auto-generate the APNs key from the Apple Developer account. Store credentials in EAS (remote) so CI builds can access them without developer machines.

**Acceptance Criteria:**
- [ ] APNs Auth Key (`.p8`) generated or uploaded for `com.gastosgo.app` via `eas credentials -p ios`
- [ ] Key is stored in EAS remote credentials store (not committed to the repo)
- [ ] `eas build --platform ios --profile production` can proceed past the credentials step
- [ ] A development build on a physical iOS device can receive a test push notification from Expo's push API (`https://exp.host/--/api/v2/push/send`)
- [ ] Apple Developer account has "Push Notifications" capability enabled for the App ID

**Effort:** M
**Layer Dependencies:** DO-05

---

## DO-07: FCM Push Certificate Setup (Android)

**Title:** Configure Firebase Cloud Messaging for Android push notifications via EAS

**Description:**
Create a Firebase project for GastosGo, download `google-services.json`, and add it to the Expo config. Register FCM credentials with EAS. Add the `expo-notifications` config plugin to `app.json` with the FCM Sender ID so Android builds embed the config.

**Acceptance Criteria:**
- [ ] Firebase project created for `com.gastosgo.app`
- [ ] `google-services.json` added to the repo root (non-secret file; contains only app config, not server keys)
- [ ] `app.json` plugins array includes `["expo-notifications", { "googleServicesFile": "./google-services.json" }]`
- [ ] FCM server key uploaded to EAS via `eas credentials -p android`
- [ ] `eas build --platform android --profile production` can proceed past the credentials step
- [ ] A development build on a physical Android device can receive a test push notification from Expo's push API

**Effort:** M
**Layer Dependencies:** DO-05

---

## DO-08: TypeScript Strict Config and Linting

**Title:** Configure ESLint, Prettier, and enforce TypeScript strict mode across the project

**Description:**
Install `eslint`, `prettier`, `eslint-config-expo`, and `@typescript-eslint/eslint-plugin`. Create `.eslintrc.js` and `.prettierrc`. Add `lint` and `format` scripts to `package.json`. Ensure `tsc --noEmit` passes on the initial scaffold. This baseline prevents type debt from accumulating during feature development.

**Acceptance Criteria:**
- [ ] `.eslintrc.js` extends `expo` and `@typescript-eslint/recommended` with `no-explicit-any: "error"`
- [ ] `.prettierrc`: `printWidth: 100`, `singleQuote: true`, `trailingComma: "all"`, `semi: false`
- [ ] `package.json` scripts: `"lint": "eslint . --ext .ts,.tsx"`, `"format": "prettier --write ."`, `"typecheck": "tsc --noEmit"`
- [ ] `npx tsc --noEmit` on the initial scaffold exits 0
- [ ] `npx eslint .` on the initial scaffold exits 0 (or with zero errors; warnings acceptable)
- [ ] `.eslintignore` excludes `node_modules/`, `.expo/`, `dist/`
- [ ] Prettier and ESLint configs are compatible (no conflicting formatting rules)

**Effort:** S
**Layer Dependencies:** DO-01

---

## DO-09: Expo Dev Client Build for Local Development

**Title:** Build and distribute an Expo Dev Client for iOS and Android simulators/devices

**Description:**
Run `eas build --profile development` for both platforms to produce development client builds. This replaces Expo Go for SDK 52 projects that use custom native modules (expo-sqlite, expo-local-authentication, expo-notifications require a dev client). Document the install step for team members.

**Acceptance Criteria:**
- [ ] `eas build --platform ios --profile development` completes and produces a `.app` for simulator
- [ ] `eas build --platform android --profile development` completes and produces a `.apk`
- [ ] Dev client connects to `npx expo start --dev-client` and hot-reloads JS changes
- [ ] `expo-sqlite` database is accessible in the dev client (a test `SELECT 1` from Drizzle returns without error)
- [ ] `expo-local-authentication` and `expo-notifications` APIs are callable without "module not found" errors
- [ ] Install instructions added to `README.md` (platform sim install command + QR code flow)

**Effort:** M
**Layer Dependencies:** DO-05, DO-04
