# 01: Log an Expense end-to-end

**What to build:** A user can open the app and log an Expense. The app boots as a managed Expo app with the four-tab shell + center add FAB; tapping add opens the bottom sheet where they enter an amount, pick a Category, a Payment Method, and a date; saving writes the Expense to local SQLite and it immediately appears in a list on Home. This is the first tracer bullet, so it carries the one-time setup: Expo scaffold, EAS profiles, the SQLite migrations runner, and the expense/category tables with the 7 default Categories seeded on first launch.

**Blocked by:** None (can start immediately)

**Status:** done

- [ ] `npx create-expo-app@latest` (expo-router + TypeScript); `app.json` for iOS **and** Android; `eas.json` with `development`/`preview`/`production`/`e2e-test` profiles; `.npmrc` keeps `legacy-peer-deps=true`
- [ ] Four tabs (Home, History, Budgets, Settings) + center add FAB route; add-expense as a modal/sheet route with native iOS slide
- [ ] `expo-sqlite` + a migrations runner (plain SQL mirroring `supabase/migrations`); expense + category tables; text primary keys via `generateId()`; dates stored as `YYYY-MM-DD` text
- [ ] 7 default Categories seeded locally on first launch (not shared `user_id IS NULL` rows)
- [ ] Add-expense bottom sheet (`@gorhom/bottom-sheet` + Reanimated + Gesture Handler): amount, Category picker, Payment Method segmented control, native date picker (`@react-native-community/datetimepicker`)
- [ ] Save disabled until `amount > 0 && category`
- [ ] Saved Expense writes to SQLite and appears in a Home list, peso-formatted (`Intl.NumberFormat('en-PH')`)
- [ ] Styles in co-located `<file>.styles.ts`; Glossary vocabulary in code/copy
