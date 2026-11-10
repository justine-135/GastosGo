# Modal Screens Review

Reviewed: `app/modals/add-expense.tsx`, `app/modals/add-recurring.tsx`.
(Also referenced: `features/savings/SavingsScreen.tsx`, which shares the same patterns.)

---

## Cross-cutting (both modals + SavingsScreen)
**Severity:** Medium

### Issues
- [Medium] **Duplicated "local ISO date" IIFE** for the default date:
  `(() => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset()*60000).toISOString().split('T')[0]; })()`
  appears verbatim in `add-expense.tsx:50`, `add-recurring.tsx:28`, and again inside both `DateTimePicker onChange` handlers. A near-identical variant is in `useRecurring.ts:74` and `utils/format.ts`. Extract `todayLocalISO()` and `toLocalISO(date)` into `utils/format.ts` and replace all five call sites. This both de-duplicates and guarantees one timezone convention.
- [Medium] Inline category `onPress={() => setSelectedCategoryId(cat.id)}` allocates per-chip per-render. Harmless alone, but it's why memoizing `CategoryChip` wouldn't help. If list perf matters, use a stable handler keyed by id.
- [Medium] **Style convention not followed.** Both modals have `StyleSheet.create(...)` inline. Each needs a co-located `<name>.styles.ts` (e.g. `add-expense.styles.ts` next to `add-expense.tsx`).
- [Low] Both modals duplicate the `segmentRow`/`segment`/`segmentActive` payment-method UI and styles (and `SavingsScreen`/`settings` have similar segment controls). A shared `<SegmentedControl options={} value={} onChange={} />` would remove ~4 copies.
- [Low] Hardcoded hex throughout both StyleSheets (token note).

---

## add-expense (`app/modals/add-expense.tsx`)
**Severity:** Medium

### Issues
- [Medium] The `interface Props { expenseId?, initialAmount?, ... }` (lines 18–27) is **declared but never used** — the component takes no props and reads everything from `useLocalSearchParams`, whose inline type (lines 30–38) duplicates `Props`. Dead code + duplicated type. Delete `Props` or use it as the `useLocalSearchParams<Props>()` generic.
- [Medium] `handleSave` invalidation path lives in the hooks, but note editing changes the date → the row can move months. `useUpdateExpense` invalidates the **new** month (from `expense.date`) but not the **old** month if the date changed during edit. Moving an expense from Jan to Feb will leave the Jan list stale until refetched. Flag for the data/hooks layer.
- [Low] `handleAmountChange` sanitizes decimals well, but `add-recurring.tsx` uses a *different, weaker* sanitizer (`v.replace(/[^0-9.]/g, '')`) for the same concept — allows multiple dots. Unify into a `sanitizeAmount` helper (ties into the numeric-input note in onboarding).
- [Low] `handleAddCategory` hardcodes `color: '#F4A261'` for every new category — all user-created categories get the brand orange, making them visually indistinguishable in the pie chart/legend. Consider a color picker or rotating palette.
- [Low] `date` default initializer passes an IIFE as the `useState` initial value *expression* (runs every render even though result is discarded after first) — correct behavior but prefer lazy init `useState(() => todayLocalISO())`.

### Strengths
- Validation (`validate()` populating an `errors` map), `mutateAsync` wrapped in try/catch with an `Alert` fallback and `console.error`, auto-focus on amount, `KeyboardAvoidingView`, `keyboardShouldPersistTaps="handled"`, notes `maxLength` + char counter, `maximumDate={new Date()}` on the picker. This modal is thorough and handles edit vs create cleanly via `isEditing`.

---

## add-recurring (`app/modals/add-recurring.tsx`)
**Severity:** Medium

### Issues
- [Medium] Two `useEffect`s both touch `categoryId`: one pre-selects `categories[0].id` when not editing, the other seeds all fields from the rule when editing. They can race on first mount in edit mode (the pre-select effect's guard is `!isEditing`, so actually safe — but the ordering reliance is subtle). Add a comment clarifying they're mutually exclusive by `isEditing`.
- [Medium] The edit-seed effect depends on `rules` (the full recurring list). Every time `rules` refetches/changes, the effect re-runs and **overwrites the user's in-progress edits** with the stored rule values. If the user edits the amount, then `useRecurringRules` refetches in the background, their typed amount is clobbered. Seed once (guard with a `hasSeeded` ref, or key the effect on `params.ruleId` only and read `rules` without depending on it).
- [Low] Weaker amount sanitizer (`replace(/[^0-9.]/g,'')`) allows `1.2.3` — see add-expense note.
- [Low] `firstDueDate` uses the same duplicated date IIFE.

### Strengths
- Edit/create unified cleanly; `isSaving` disables save with a spinner; validation covers name/amount/category. `autoFocus` on name, proper segmented controls for frequency + payment with full a11y. Good.

---

## SavingsScreen (`features/savings/SavingsScreen.tsx`) — referenced
**Severity:** Low

### Issues
- [Low] `const USER_ID = LOCAL_USER_ID` imported but **never used** in this file (the savings/profile queries don't reference it here). Dead import — remove.
- [Low] `handleAddIncome` validates then calls `addIncome.mutate()`, but the mutation's `mutationFn` *re-parses* `incomeAmount` independently — the validated `a` isn't passed through, so validation and the actual insert read state separately. Pass the parsed value into the mutation to avoid drift.
- [Low] `isLoading = loadingSavings` is a pointless rename.
- [Low] Mutation has no `onError` — a failed income insert closes nothing and shows no error (only `isPending` is handled).

### Strengths
- Mode-driven UI (`salary`/`mixed`/`target`) is clean and well-separated. Good breakdown card, correct `+`/`−` sign handling on the gap with semantic colors. Inline add-income form with proper cancel/save states.
