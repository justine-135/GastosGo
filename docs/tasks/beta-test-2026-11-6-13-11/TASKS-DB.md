# TASKS-DB — beta-test-2026-11-6-13-11

Target agent: `db-schema-engineer`
Source report: `docs/bugs/bug-report-2026-11-06-1311.md`

---

## TASK-DB-01: Align recurringRules paymentMethod enum to title-case to match PaymentMethod type

**Bug ref:** BUG-30
**Priority:** P1
**Type:** BUG
**Files touched:**
- `db/schema/recurringRules.ts`
- `drizzle/` (new migration file to be generated)

### What's broken
The `recurringRulesTable` schema defines `payment_method` with lowercase enum values `['cash', 'gcash', 'card', 'bank_transfer']`. The app's canonical `PaymentMethod` type (`lib/db/types.ts`) uses title-case `['Cash', 'GCash', 'Card', 'Others']`. The UI writes title-case values; SQLite stores them without constraint enforcement, so rows silently store `'GCash'` against a schema that declares `'gcash'`. When Supabase sync runs against a stricter Postgres enum, all existing rows will be rejected. Additionally, `'Others'` (the UI value) has no schema equivalent — `'bank_transfer'` is in the schema but never surfaces in the UI.

### Reproduction steps
1. Add a recurring bill and select "GCash" as the payment method.
2. Inspect the `recurring_rules.payment_method` column in the SQLite DB.
3. Observe stored value is `'GCash'` but schema enum declares `'gcash'`.

### Acceptance criteria
- [ ] Schema enum updated to `['Cash', 'GCash', 'Card', 'Others']` matching `PaymentMethod` exactly.
- [ ] A new Drizzle migration is generated and committed alongside the schema change.
- [ ] `'bank_transfer'` is removed from the schema enum (not surfaced in UI; replaced by `'Others'`).
- [ ] Existing rows in `recurring_rules` are backfilled: `cash→Cash`, `gcash→GCash`, `card→Card`, `bank_transfer→Others` in the migration's `UPDATE` statement.
- [ ] TypeScript compiles with no type errors after the change.

### Technical notes
Schema location: `db/schema/recurringRules.ts` line 22-24:
```ts
paymentMethod: text("payment_method", {
  enum: ["cash", "gcash", "card", "bank_transfer"],
}).notNull().default("cash"),
```
Target state:
```ts
paymentMethod: text("payment_method", {
  enum: ["Cash", "GCash", "Card", "Others"],
}).notNull().default("Cash"),
```
Migration must include `UPDATE recurring_rules SET payment_method = CASE ... END` before the schema is applied. Existing migrations live in `drizzle/0000_true_radioactive_man.sql` and `drizzle/0001_dusty_cargill.sql`. Generate the next migration via `npx drizzle-kit generate` after updating the schema file, then manually append the backfill UPDATE to the generated SQL.

Risk: `expensesTable` also has a `paymentMethod` column — check `db/schema/expenses.ts` for the same mismatch and include a matching migration if found (coordinate with TASK-BE-01 which touches `lib/db/stubs.ts`).

### Dependencies
- TASK-BE-01 touches `lib/db/stubs.ts` (cast on line 445) which references the same enum. Sequence DB-01 first so the type contract is settled before BE-01 updates the cast.
- Coordinate with TASK-BE-01 on the final agreed enum values before writing the migration.
