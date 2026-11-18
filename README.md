# GastosGo

Personal finance tracker for working Filipinos and students. Centers on the
**Savings Gap** — showing users exactly why their month-end balance is lower
than expected.

> **Status:** pre-implementation. The app code was wiped for a fresh build.
> This repo currently holds the design prototypes, domain model, and tech-stack
> research that the implementation will be built from.

## Concept

Instead of just listing expenses, GastosGo frames the month around one number:
how much you're actually saving versus what you planned to save. It supports
three income modes:

- **Salary** — a single fixed monthly income figure.
- **Mixed** — salary plus freelance/irregular income logged separately.
- **Target** — a savings goal with no income logged.

See [`GLOSSARY.md`](GLOSSARY.md) for the full domain language (Savings Gap,
Spending Cap, Budget Cycle, Sync Queue, and more).

## Design & architecture

- **Prototypes** — interactive HTML mockups in [`prototype/`](prototype/)
  (`gastosgo.html`, `card-designs.html`, `palette.html`).
- **Tech stack** — [`docs/tech-stack.md`](docs/tech-stack.md): Expo (managed),
  Expo Router, offline-first `expo-sqlite` as source of truth with Supabase as
  sync target, `@gorhom/bottom-sheet` + Reanimated for the add-expense sheet,
  anonymous Supabase auth.
- **E2E & release** — [`docs/e2e-and-release.md`](docs/e2e-and-release.md):
  Maestro for E2E, EAS Build/Submit/Update for shipping iOS from Windows.
- **Decisions** — architecture decision records in [`docs/adr/`](docs/adr/).

**iPhone-first, Android-ready.** Staying in managed Expo keeps Android a
build-target flip rather than a rewrite.

## Repo layout

| Path | Contents |
|---|---|
| `prototype/` | Interactive HTML design prototypes |
| `docs/` | Tech stack, E2E/release notes, ADRs |
| `supabase/` | Database migrations and edge functions |
| `GLOSSARY.md` | Domain language (source of truth for naming) |
