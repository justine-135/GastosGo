# GastosGo — Implementation Tech Stack

Research notes for turning the completed prototypes (`prototype/gastosgo.html`, `card-designs.html`, `palette.html`) into a shippable app. **iPhone-first, Android-ready.** Supabase backend already exists — this reviews it rather than re-deciding it.

> Version pins reflect the current Expo release at time of writing (**SDK 58 / React Native 0.88**, per [docs.expo.dev/versions/latest](https://docs.expo.dev/versions/latest/)). Confirm the exact SDK at scaffold time — `npx create-expo-app@latest` always installs the matching, compatible package versions for you. **Do not hand-pin Expo-managed packages**; use `npx expo install <pkg>` so versions stay aligned with the SDK.

---

## 1. What the design actually needs

Read from the prototype, not assumed:

| Design element (prototype) | Implementation requirement |
|---|---|
| 4 tabs + center FAB (`#tab-bar`), push screens with iOS slide (`.screen.slide-out`), 2-step onboarding stack | **Navigation** with native-feel stack + tabs |
| Add-expense **bottom sheet** with drag-to-dismiss, rubber-band, velocity handoff (`setupDrag`, `rubberband`) | **Native bottom sheet + gesture/animation** libs — don't hand-roll |
| Spring/drawer easing tokens, progress-bar fills, toggle thumb springs, staggered card entrances | **Reanimated** (the easing curves map 1:1 to Reanimated) |
| `Intl.NumberFormat('en-PH')`, `tabular-nums`, `₱` formatting | Built-in `Intl` (Hermes supports it) — no money lib needed |
| `<input type="date">`, `fmtDate` relative dates ("Today"/"Yesterday") | **Date picker** + lightweight date formatting |
| Offline-first: Glossary defines **Sync Queue** (local SQLite table of pending writes) + **Recently Deleted** (soft-delete) | **SQLite as source of truth**, Supabase as sync target |
| Savings Gap / Spending Cap math (`computeGap`, `spendingCap`) | Pure TS — no library; just unit-test it |
| Category picker, segmented payment control, forms with validation (`checkSaveBtn`) | Local component state; a form lib is optional (see §4) |
| Emoji category icons + line-drawn tab SVGs | Emoji are text; tab icons → an icon set |
| `expo_push_token` + Edge Functions (`bill-reminders`, `budget-alerts`) already push via Expo Push API | **expo-notifications** (push token source) |
| "PIN & Biometric Lock" (Glossary: **Lock Timeout**) — marked SOON | **expo-local-authentication** (deferred, but plan for it) |

---

## 2. Core framework — Expo (managed)

**Already decided by the repo**, not a fresh choice:
- `.env.example` uses the `EXPO_PUBLIC_` prefix → Expo client.
- Edge function pushes to `https://exp.host/--/api/v2/push/send` → Expo push tokens.
- `.npmrc` has `legacy-peer-deps=true`.

Use the **managed workflow** (config plugins, EAS Build) — nothing in the design needs a bare/custom native module. Everything required (SQLite, notifications, biometrics, secure store) has a first-party Expo module.

- **expo** ~58 (SDK 58, bundles React Native 0.88, React 19) — [expo.dev/changelog](https://expo.dev/changelog)
- Scaffold: `npx create-expo-app@latest` (ships expo-router + TypeScript template).
- **EAS Build** for iOS (you have no Mac-dependency this way) — [docs.expo.dev/build/setup](https://docs.expo.dev/build/setup/).

**iPhone-first / Android-later note:** staying in managed Expo means Android is a build-target flip later, not a rewrite. Keep `app.json` with both platforms from day one; just don't test/ship Android until later. No iOS-only native code.

---

## 3. Recommended packages (each justified by the design)

Install everything Expo-managed with `npx expo install` so SDK alignment is automatic.

### Navigation — Expo Router
The prototype is a tab shell + pushed screens + modal sheet. **Expo Router** (file-based, built on React Navigation) is the default in the Expo template and gives the native iOS push slide (`.slide-out`) and tab bar for free.
- `expo-router` + its peers (`react-native-screens`, `react-native-safe-area-context`) — installed by the template.
- Tabs → `app/(tabs)/`, add-sheet → a modal route or the sheet lib below.
- Docs: [docs.expo.dev/router/introduction](https://docs.expo.dev/router/introduction/)

### Local database — expo-sqlite  ✅ matches Glossary
The Glossary explicitly says the **Sync Queue** is "the local **SQLite** table of write operations." The schema uses **text primary keys** (`id text PRIMARY KEY`) = client-generated IDs, which is exactly the offline-first pattern. Use first-party **expo-sqlite** (managed, no config plugin needed, Android-safe).
- `expo-sqlite` — [docs.expo.dev/versions/latest/sdk/sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- A thin query layer + a migrations runner (plain SQL files mirroring `supabase/migrations`). No ORM needed for 6 tables; if you want typed queries later, **Drizzle** has an expo-sqlite driver — defer it.

### Supabase client — @supabase/supabase-js v2
Backend is v2 (`esm.sh/@supabase/supabase-js@2` in the edge functions). Use the same major on the client.
- `@supabase/supabase-js` ^2
- Auth session persistence needs **AsyncStorage** + `expo-sqlite`/secure storage; follow the official RN guide (set `detectSessionInUrl: false`, provide `storage`).
- **Anonymous auth** per [ADR 0002](adr/0002-anonymous-only-auth-mvp.md): `supabase.auth.signInAnonymously()` on first launch. No email/password UI for MVP.
- Guide: [supabase.com/docs/guides/auth/quickstarts/react-native](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- `@react-native-async-storage/async-storage` — `npx expo install` it (Supabase auth storage + onboarding flags).

### Bottom sheet + gestures — the add-expense sheet
The prototype hand-codes drag/velocity/rubber-band. Don't port that by hand. Use:
- `@gorhom/bottom-sheet` — drag-to-dismiss, snap points, velocity, exactly this UX. [gorhom.dev/react-native-bottom-sheet](https://ui.gorhom.dev/components/bottom-sheet/)
- Its peers: **react-native-reanimated** + **react-native-gesture-handler** (`npx expo install`). These also power every easing/spring token in the prototype (`--ease-spring`, progress fills, toggle thumb).
- Reanimated: [docs.swmansion.com/react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)

### Notifications — expo-notifications  ✅ matches edge functions
`profiles.expo_push_token` is read by `bill-reminders`/`budget-alerts`. The app must register for push and write that token.
- `expo-notifications` — register, get Expo push token, write to `profiles`. [docs.expo.dev/versions/latest/sdk/notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- ⚠️ `profiles` table in `20240001000000_initial_schema.sql` has **no `expo_push_token` column**, but the edge function selects it (`profiles!inner(expo_push_token)`). **This is a schema gap — add a migration** (see §5).

### Date entry + formatting
- `@react-native-community/datetimepicker` (native iOS wheel/calendar) for the expense date field. `npx expo install`. [docs.expo.dev/versions/latest/sdk/date-time-picker](https://docs.expo.dev/versions/latest/sdk/date-time-picker/)
- Relative-date logic (`fmtDate`) is ~10 lines — keep it as a util. Only add **date-fns** if formatting needs grow; not required now.

### Money / numbers
No library. Hermes ships `Intl.NumberFormat` → `new Intl.NumberFormat('en-PH', {…})` works on device exactly as in the prototype. Store `amount` as the schema's `numeric`; handle as JS number for a peso-tracking app (no fractional-cent accounting needed). *Shortcut: JS number for money is fine at PHP whole-peso scale; revisit if multi-currency or cents precision is ever required.*

### Icons
- `@expo/vector-icons` (bundled) for the tab-bar line icons (Feather set matches the prototype's stroke SVGs). Category icons stay as emoji strings (already in `categories` seed data).

### Deferred (design shows them as "SOON" — build later, don't install yet)
- **expo-local-authentication** — PIN/biometric lock (Glossary **Lock Timeout**). [docs.expo.dev/versions/latest/sdk/local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- **expo-secure-store** — store the PIN hash when that feature lands.
- **Recurring Rules** UI — table + edge function exist; screen is SOON.

### State management
Not needed as a library. The prototype is one plain `S` object. Use React state + a small context (or **Zustand** if you want a global store without boilerplate — optional, one file). Server/local data is driven by SQLite reads, not a cache lib. **Skip React Query** unless the sync layer grows complex.

---

## 4. Explicitly skipped (and why)

- **No UI kit** (NativeBase/Tamagui/RN Paper) — the prototype is a bespoke design system (tokens, custom components). A kit would fight it. Build the ~12 components from the prototype CSS directly. Per project convention, styles go in co-located `<file>.styles.ts`.
- **No form library** (Formik/RHF) — two forms (add-expense, income), validation is a single `amount > 0 && category` check. Plain state. Add **react-hook-form** only if forms multiply.
- **No ORM** initially — 6 tables, raw SQL mirrors the existing migrations.
- **No money library** — see §3.
- **No i18n library** — single locale (en-PH) for MVP; Taglish is copy, not localization.
- **No custom dev client / bare workflow** — managed Expo covers every native need here.

---

## 5. Backend review — findings & gaps

The Supabase schema (`supabase/migrations/`) is solid and offline-first-aware. Issues to fix before wiring the client:

1. **Missing `expo_push_token` column.** `profiles` has no such column, but `bill-reminders/index.ts` and (likely) `budget-alerts` select it. Add:
   ```sql
   ALTER TABLE public.profiles ADD COLUMN expo_push_token text;
   ```
   New migration file, same timestamp convention.

2. **RLS is `authenticated`-only — confirm anonymous users count.** All policies target `TO authenticated`. Supabase **anonymous** sessions *are* `authenticated` (they get a real JWT with `is_anonymous: true`), so the policies work — but verify, since ADR 0002 makes anon the *only* auth path. [supabase.com/docs/guides/auth/auth-anonymous](https://supabase.com/docs/guides/auth/auth-anonymous)

3. **`users` mirror table vs `auth.uid()`.** `expenses.user_id` etc. reference `auth.users(id)` (the Supabase UUID), while the Glossary/prototype use client-generated text IDs (`id text PRIMARY KEY`). The client must map its local `generateId()` IDs to the authed UUID for `user_id` foreign keys. Make the sync layer aware of both ID spaces.

4. **`categories.user_id IS NULL` = system defaults.** The 7 default categories (Glossary: "seeded on first launch") should be seeded as `user_id = NULL` rows (readable by all via the select policy) **or** seeded per-user locally. Decide which; the prototype seeds them client-side. Simplest: seed locally in SQLite, don't rely on shared NULL rows.

5. **`date` stored as `text`** (`YYYY-MM-DD`) — matches the prototype (`e.date` strings). Keep it; don't convert to `date` type, the client logic depends on string compares (`b.date.localeCompare(a.date)`).

6. Run `supabase` advisors (security + performance) after applying migrations — FK indexes already added in `20240002000000`, good.

---

## 6. Suggested build order

1. `npx create-expo-app@latest` (TypeScript + expo-router template), wire `app.json` for iOS **and** Android, EAS project.
2. SQLite layer: migrations runner + query functions mirroring the 6 tables + the **Sync Queue** table (Glossary).
3. Port the pure domain math (`computeGap`, `spendingCap`, `budgetedSpent`) as tested TS utils — **unit-test these first**, they're the product's core.
4. Build the design-system components from the prototype CSS (tokens → a theme file; styles in `.styles.ts`).
5. Screens: onboarding → tabs (Home, History, Budgets, Settings) → add-expense sheet.
6. Supabase: anon sign-in on launch, then the Sync Queue drain (enqueue local writes, replicate on auth/foreground).
7. Notifications: register, store `expo_push_token` (after the schema fix).
8. E2E: re-create `.maestro/` flows (onboarding, add-expense) once screens exist, then wire the EAS Workflows PR gate (`.eas/workflows/`).
9. Defer: PIN/biometric lock, Recurring Rules UI.

---

## 7. E2E testing — Maestro

**Maestro** is the choice. It was wired here before the fresh-implementation wipe (3/4 flows passing at the time); the `.maestro/` flows must be **re-created from scratch** — they no longer exist on disk.

- It's the **only E2E tool Expo's official docs name** — Detox isn't mentioned. [docs.expo.dev/build-reference/e2e-tests](https://docs.expo.dev/build-reference/e2e-tests/)
- Its CLI **runs natively on Windows 11** (Java 17 + PATH, no WSL) — matches the dev machine. ⚠️ This reflects *current* Maestro docs; older releases required WSL, so verify against the version you install.
- First-class **EAS Workflows** job (built-in `maestro` step), so the same flows run in CI.
- ⚠️ **iOS E2E needs a macOS Simulator** — it cannot run on Windows-only hardware. Iterate locally against **Android**, run iOS flows in CI on EAS's macOS runners.
- ⚠️ **iPhone-first, but Android-iterated:** local Maestro runs validate **Android**; the primary iPhone flows are only exercised in **CI on EAS macOS runners**. Accept this gap or get Mac/Simulator access for local iOS E2E.

See `docs/e2e-and-release.md` for the primary-source detail.

---

## 8. Production / release workflow — EAS

Ship from Windows, no Mac. Full detail + source URLs in `docs/e2e-and-release.md`.

- **EAS Build** — compiles iOS in Expo's hosted macOS cloud. [docs.expo.dev/build/setup](https://docs.expo.dev/build/setup/)
- **`eas.json` profiles** — `development` (dev-client), `preview` (production-like internal), `production` (store), plus an `e2e-test` profile producing a `.app`/`.apk` for the CI gate.
- **EAS Submit** — `.ipa` → App Store Connect/TestFlight; `.aab` → Play Console.
- **EAS Update** — OTA JS/asset changes, gated by the **runtime-version rule**: an update only runs if its runtime version matches the build's; any native-code change forces a new build (use the `fingerprint` policy to track this).
- **CI gate** — an EAS Workflow (`.eas/workflows/`) on `pull_request`: build with the `e2e-test` profile, then run the `.maestro` flows against that artifact. Prefer `.eas/workflows/` over `.github/workflows/` for the native `maestro` job type (see `docs/e2e-and-release.md` §2).

Repo has **no `.maestro/`, `eas.json`, or `.eas/workflows/` yet** — these are conventions to create.

---

## Sources
- [Expo SDK versions (latest)](https://docs.expo.dev/versions/latest/) · [Expo changelog](https://expo.dev/changelog)
- [Expo Router](https://docs.expo.dev/router/introduction/) · [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) · [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) · [datetimepicker](https://docs.expo.dev/versions/latest/sdk/date-time-picker/) · [local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [Supabase + React Native auth](https://supabase.com/docs/guides/auth/quickstarts/react-native) · [Supabase anonymous auth](https://supabase.com/docs/guides/auth/auth-anonymous)
- [@gorhom/bottom-sheet](https://ui.gorhom.dev/components/bottom-sheet/) · [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- Repo: `supabase/migrations/20240001000000_initial_schema.sql`, `supabase/functions/bill-reminders/index.ts`, `GLOSSARY.md`, `docs/adr/0002-anonymous-only-auth-mvp.md`, `.env.example`
