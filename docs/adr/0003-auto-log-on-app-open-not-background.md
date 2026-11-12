# Auto-log recurring expenses on app open, not via background fetch

When a Recurring Rule is set to Auto-Log, the expense is created on the first app open on or after the due date — not via Expo Background Fetch at midnight. This means auto-log is not truly silent: the app must be opened for the expense to be recorded.

We chose this because background fetch requires an additional OS permission and its execution timing is unreliable on both iOS (which aggressively throttles background tasks) and Android (battery optimisation). The user opens the app daily to log expenses; the one-day delay is acceptable. A brief toast confirms what was auto-logged so the user is never surprised by an unexplained balance change.

Auto-log is a per-rule opt-in and is expected to be used for fixed-amount bills (e.g. Netflix) where the amount never changes. Variable bills should use Remind Me instead.
