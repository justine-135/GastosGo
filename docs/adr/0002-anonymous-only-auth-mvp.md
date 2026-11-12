# Anonymous-only auth for MVP (no account recovery)

GastosGo uses Supabase anonymous auth for MVP: the user's cloud identity is created automatically on first launch with no email or password. This gives zero-friction onboarding but means that if the user loses their device, their cloud data is unrecoverable — the anonymous identity is gone with the device.

We chose this deliberately for MVP because the primary value proposition is offline-first local tracking; cloud sync is a backup, not the source of truth. Adding an email-link upgrade path in Settings is deferred to a post-MVP release. Any engineer reading this: the missing account-recovery flow is intentional, not an oversight.

## Consequences

- A user who loses their phone loses their Supabase data. Local SQLite data is also gone with the device.
- Upgrading to email auth later requires a Supabase identity migration and a new Settings screen.
