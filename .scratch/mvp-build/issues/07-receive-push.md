# 07: Receive a push end-to-end

**What to build:** A user receives bill reminders and budget alerts on their device: the app registers for push and stores its Expo token where the existing edge functions read it, and a push from `bill-reminders` / `budget-alerts` actually lands on the device.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Schema migration `ALTER TABLE public.profiles ADD COLUMN expo_push_token text;` (mirror into the SQLite migration set and `supabase/migrations`); run Supabase advisors after
- [ ] `expo-notifications`: register, obtain Expo push token, write it to `profiles`
- [ ] Verify a `bill-reminders` / `budget-alerts` push (via `exp.host/--/api/v2/push/send`) lands on the device
