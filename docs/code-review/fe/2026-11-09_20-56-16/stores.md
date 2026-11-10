# Stores Review

Reviewed: `uiStore`, `themeStore`, `syncStore`.

---

## uiStore (`stores/uiStore.ts`)
**Severity:** Low

### Issues
- [Low] `selectedMonth`/`selectedYear` are initialized once at module load from `const now = new Date()`. If the app is left open across midnight into a new month, the default never updates. Acceptable (user navigates manually), but worth a comment.
- [Low] Consumers call `useUIStore()` with no selector (`MonthNavigator`, several screens), subscribing to the whole store. Any change to `activeCategoryFilter` re-renders every month-navigator. Encourage selector usage: `useUIStore(s => s.selectedMonth)`. This is a store-design nudge, applied at call sites.
- [Info] Month-rollover logic in `navigatePreviousMonth`/`navigateNextMonth` is duplicated inverse logic. Fine as-is, but a single `addMonths(month, year, delta)` helper would remove the branch duplication and be unit-testable.

### Strengths
- Clear, correct 1–12 month handling with proper year rollover at both boundaries. Well-commented (`// 1–12`, `// null = "All"`). Typed interface is clean.

---

## themeStore (`stores/themeStore.ts`)
**Severity:** Info

### Issues
- [Info] Uses double-quote style while `uiStore`/`syncStore` use single quotes — minor inconsistency, likely a formatter config gap. Align Prettier config.

### Strengths
- Correct use of `persist` + `createJSONStorage(AsyncStorage)` so the theme survives restarts — and `app/_layout.tsx` reads `mode` from it to drive `GluestackUIProvider`. This is the one store that genuinely needs persistence and it has it. The `create<ThemeState>()(...)` curried form (required for the persist middleware's typing) is correct.

---

## syncStore (`stores/syncStore.ts`)
**Severity:** Low

### Issues
- [Low] `lastSyncedAt` is **not persisted**, so `settings.tsx`'s "Last Synced" row resets to blank on every cold start even though a backup happened. Given it's shown to the user as durable info, wrap this store in `persist` (at least for `lastSyncedAt`) like `themeStore`.
- [Low] `pendingCount` and `setPendingCount` exist but I found no writer wiring in the reviewed set (settings only reads `isSyncing`/`lastSyncedAt`). Confirm it's consumed by the sync layer; if not, it's dead API surface.

### Strengths
- Minimal, correctly typed flat store. Setters are granular and side-effect-free. Good fit for ephemeral sync status.
