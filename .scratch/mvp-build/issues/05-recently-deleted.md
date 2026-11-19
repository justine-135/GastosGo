# 05: Recently Deleted

**What to build:** A user can delete an Expense and recover it: deletes are soft, held in a Recently Deleted section in Settings for 30 days, from which the user can restore an Expense before it is permanently removed.

**Blocked by:** 01

**Status:** done

- [ ] Delete an Expense → soft-delete (not removed from SQLite), disappears from Home/History
- [ ] Recently Deleted section in Settings lists soft-deleted Expenses held for 30 days
- [ ] Restore returns the Expense to Home/History
- [ ] Query layer tested against a temp SQLite db: soft-delete hides, restore returns, 30-day window
