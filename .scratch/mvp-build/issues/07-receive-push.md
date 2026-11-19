# 07: Receive a push end-to-end

**What to build:** A user receives bill reminders and budget alerts on their device: the app registers for push and stores its Expo token where the existing edge functions read it, and a push from `bill-reminders` / `budget-alerts` actually lands on the device.

**Blocked by:** 06

**Status:** done

- [x] Schema migration `ALTER TABLE public.profiles ADD COLUMN expo_push_token text;` (mirror into the SQLite migration set and `supabase/migrations`); run Supabase advisors after
- [x] `expo-notifications`: register, obtain Expo push token, write it to `profiles`
- [ ] Verify a `bill-reminders` / `budget-alerts` push (via `exp.host/--/api/v2/push/send`) lands on the device

## Manual verification

1. Run the app on a physical device (iOS or Android) — Expo Go or a development build.
2. Accept the OS permission prompt for notifications.
3. In Supabase Studio → Table Editor → `profiles`, confirm the row for your user now has a non-null `expo_push_token` (looks like `ExponentPushToken[xxxxxx]`).
4. Send a test push via the Expo Push Notification Tool (`https://expo.dev/notifications`) or curl:
   ```
   curl -X POST https://exp.host/--/api/v2/push/send \
     -H "Content-Type: application/json" \
     -d '{"to":"<token>","title":"Test","body":"GastosGo push works"}'
   ```
5. Confirm the notification appears on the device.
6. Once `bill-reminders` and `budget-alerts` edge functions are deployed, trigger them and confirm their pushes land as well.
