---
name: bug-memory
description: Check and update the bug ledger before fixing. Prevents repeating the same fix for a recurring bug — escalates to root cause or new solution instead.
triggers:
  - /bug-memory
---

# Bug Memory

**Purpose:** Stop fix loops. Before applying any fix, check the ledger. If the bug was fixed with the same approach before and recurred, that fix didn't work — find the root cause or a different solution instead.

**Ledger location:** `.claude/agent-memory/mobile-beta-tester/bug-ledger.md`

---

## How to use this skill

### Before fixing a bug

1. Read `.claude/agent-memory/mobile-beta-tester/bug-ledger.md`.
2. Search for the bug by ID (e.g. BUG-01) or by symptom keywords.
3. Check the `Status` and `Attempts` fields:
   - **No prior entry** → proceed with the fix normally, then log it (see below).
   - **Status: fixed, no recurrence** → proceed, the previous fix may have been partially reverted or regressed elsewhere; note this in the new attempt.
   - **Status: recurred** → the previous fix didn't hold. **Do NOT repeat the same fix.** Read the `Root cause` field. If it says `unknown`, investigate root cause before touching code. If a root cause is known, apply a structurally different fix.
   - **Status: investigating** → join the investigation; don't add another patch.

### After fixing a bug

Append or update the ledger entry using this format:

```
## BUG-XX — <short symptom title>

**First seen:** YYYY-MM-DD  
**Status:** fixed | recurred | investigating  
**Attempts:**
1. YYYY-MM-DD — <what was changed> — <result: resolved / recurred on YYYY-MM-DD>
2. YYYY-MM-DD — <different approach> — <result>

**Root cause:** <one sentence, or "unknown — needs investigation">  
**Files touched:** `path/to/file.ts`, ...  
**Notes:** <anything that helps the next person avoid re-patching>
```

### Rules

- **Same fix twice = blocked.** If attempt N and the proposed fix are identical (same file, same change), stop and investigate root cause instead.
- One entry per bug ID. Update the existing entry; don't create duplicates.
- Set `Status: recurred` as soon as a fixed bug reappears, before starting the next attempt.
- If root cause is confirmed, write it even if the fix is still in progress — it prevents others from patching symptoms.

---

## Usage examples

**Standalone — look up a bug:**
> /bug-memory BUG-02

Reads the ledger and reports what's known about BUG-02: status, attempts, root cause.

**During a test session:**
The mobile-beta-tester agent loads this skill and checks the ledger before logging any new fix. After a fix is applied, it updates the ledger entry.

**After a fix agent runs:**
> /bug-memory update BUG-05 — fixed by aligning userId constant; root cause: two separate userId literals in stubs vs hooks

Appends attempt #N to the BUG-05 entry and sets Status to fixed.
