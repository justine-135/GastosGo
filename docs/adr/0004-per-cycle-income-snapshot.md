# ADR 0004 — Per-cycle income snapshot

**Status**: Accepted

## Context

Income figures (salary, freelance, expected savings) are stored in a single `AppSettings` row. If the user updates their salary mid-year, recalculating the Savings Gap for any past cycle becomes impossible — the old value is gone.

The user confirmed: income may change between cycles, and past cycle data must remain correct.

## Decision

On the first app open of each new Budget Cycle (lazy detection), prompt the user to review and optionally update their income figures. Once dismissed (with or without changes), create an immutable **Cycle Snapshot** row capturing the confirmed figures. All Savings Gap calculations for a cycle use that cycle's snapshot, not the current settings.

## Alternatives considered

**Update settings in place (no history)**: Simpler schema. Rejected because it makes past-cycle Savings Gap recalculation incorrect after any income change.

**Silent snapshot**: No friction. Rejected because the user may have a salary change that month and would miss the chance to record it before expenses start accumulating.

## Consequences

- New `cycle_snapshots` table required in the schema.
- Cycle boundary detection must run on every app open (cheap date comparison).
- Multi-cycle navigation (post-MVP) can correctly display historical Savings Gap values.
