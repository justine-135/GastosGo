# 06: Anon auth + Sync Queue drain

**What to build:** A user's local writes are backed up to Supabase without any sign-up: the app signs in anonymously on first launch, and every create/update/delete is queued and replicated to Supabase when the user is online, surviving app restarts.

**Blocked by:** 01

**Status:** done

- [ ] `@supabase/supabase-js` v2; `signInAnonymously()` on first launch (ADR 0002), no email/password UI; session persisted via AsyncStorage, `detectSessionInUrl: false`
- [ ] Add the Sync Queue table (local create/update/delete ops), persisting across restarts
- [ ] Queue drains to Supabase on auth and on app foreground
- [ ] Sync layer maps client text IDs ↔ `auth.uid()` UUID for `user_id` foreign keys
- [ ] Verify `TO authenticated` RLS policies cover anonymous (`is_anonymous: true`) sessions; run Supabase advisors
- [ ] Query layer tested against a temp SQLite db: ops enqueue, drain marks them replicated
