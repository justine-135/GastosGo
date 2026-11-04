# GastosGo — Product Requirements Document

**Version:** 1.0
**Date:** 2026-11-04
**Status:** Draft
**Author:** Mobile PRD Architect

---

## 1. Executive Summary

GastosGo is a personal finance tracker mobile application built for working Filipinos and students who struggle to understand where their money goes each month. The app enables users to log daily expenses, set category-based budgets, track recurring bills, and visualize their spending — all centered around a core "savings gap" feature that shows users exactly why their month-end balance is lower than expected. Built with an offline-first architecture and a clean, Monzo-inspired UI with Filipino pastel identity, GastosGo targets both iOS and Android via React Native (Expo).

---

## 2. Problem Statement

Working Filipinos and students consistently experience end-of-month financial shock: they expect a certain savings balance but find it significantly lower. The root causes are untracked daily micro-expenses, unmonitored category overspending, forgotten recurring bills, and no visual feedback loop to course-correct mid-month. Existing finance apps are either too complex, Western-centric, or don't surface the savings gap clearly enough for behavior change.

---

## 3. Goals & Success Metrics

### Business Goals
- Launch a production-quality portfolio app that demonstrates full-stack mobile architecture
- Demonstrate offline-first sync patterns, beautiful UI, and real-world financial UX
- Build a foundation that can be monetized later (freemium/premium tiers)

### User Goals
- Know exactly where every peso went
- Never be surprised at month-end by a lower-than-expected savings balance
- Stay within self-defined category budgets
- Never miss a recurring bill

### KPIs (Future / Post-Launch)
- Daily active usage rate (target: 5+ expense logs/week per active user)
- Budget alert engagement rate (% of users who adjust spending after alert)
- Monthly retention rate
- Savings gap accuracy (expected vs. actual within 5%)

---

## 4. Target Audience

### Primary Persona — Juan, 26, Working Professional
- **Background:** BPO employee in Quezon City, earns ₱25,000/month
- **Goal:** Save ₱5,000/month but consistently falls short
- **Frustration:** "I don't know where my money went. Payday feels far away every time."
- **Tech:** Uses GCash, Lazada, Netflix. Comfortable with mobile apps.

### Secondary Persona — Mia, 20, College Student
- **Background:** Receives ₱8,000/month allowance from parents
- **Goal:** Make her allowance last the full month and save a little
- **Frustration:** She spends impulsively on food delivery and doesn't realize until it's too late
- **Tech:** Heavy TikTok and Shopee user. Expects apps to be visually appealing.

### Supported Platforms
- iOS 16+ (iPhone)
- Android 10+ (API level 29+)
- Cross-platform via React Native (Expo)

---

## 5. Scope

### 5.1 In Scope — MVP

| # | Feature | Description |
|---|---------|-------------|
| 1 | Expense Logging | Log amount, category, merchant/notes, payment method, date |
| 2 | Category Budgets | Set monthly spending limits per category with progress tracking |
| 3 | Savings Gap Tracker | Flexible: log salary/freelance income OR set a fixed savings target |
| 4 | Recurring Expenses | Define recurring bills; auto-log or send reminders |
| 5 | Dashboard | Summary cards: total spent, budget health, savings gap status |
| 6 | Charts & Insights | Pie chart (spend by category), bar chart (monthly spend vs budget) |
| 7 | Push Notifications | Budget threshold alerts + recurring bill reminders |
| 8 | Offline-First | Full functionality without internet; syncs when connection restored |
| 9 | Cloud Backup | Data stored in cloud; accessible across device reinstalls |
| 10 | PIN / Biometric Lock | App-level security (no account required) |
| 11 | Light / Dark Mode | System-aware theming with manual override |

### 5.2 Out of Scope — Future Phases

- Multi-currency support (architecture ready, feature deferred)
- Social/shared budgets (couples, families)
- Bank/e-wallet integrations (GCash API, BPI, BDO)
- AI-powered spending insights
- Export to CSV/PDF
- Web dashboard
- Premium subscription tier
- Multi-user accounts

---

## 6. User Stories & Acceptance Criteria

### Feature 1: Expense Logging

**User Story:** As Juan, I want to quickly log an expense so I can track my spending without it feeling like a chore.

**Acceptance Criteria:**
- User can add an expense with: amount (required), category (required), payment method (required), merchant/notes (optional), date (defaults to today)
- Entry takes ≤3 taps from the home screen
- Amount supports decimal input (e.g., ₱129.75)
- Currency defaults to PHP; architecture allows future currency field
- Expense is saved immediately to local storage (offline-safe)

**Priority:** Must Have

---

### Feature 2: Category Budgets

**User Story:** As Juan, I want to set a monthly budget for food so I know when I'm about to overspend.

**Acceptance Criteria:**
- User can create/edit/delete budget categories (default set: Food, Transport, Leisure, Bills, Shopping, Health, Other)
- Each category has a monthly limit in PHP
- Progress bar shows % of budget used
- Visual warning at 80% usage (yellow); alert at 100% (red)
- Budget resets on the 1st of each month (configurable start date)

**Priority:** Must Have

---

### Feature 3: Savings Gap Tracker

**User Story:** As Juan, I want to understand why my savings at month-end are ₱5,000 less than I expected.

**Acceptance Criteria:**
- User chooses one of three income modes:
  - **Salary mode:** Log fixed monthly salary (e.g., ₱25,000)
  - **Mixed mode:** Log salary + freelance earnings separately
  - **Target mode:** Skip income, just set a savings goal (e.g., "I want to save ₱5,000 this month")
- Dashboard shows: Expected savings, Actual savings-to-date, Gap amount (positive = on track, negative = at risk)
- Gap updates in real-time as expenses are logged
- Month-end summary: "You saved ₱4,200 of your ₱5,000 goal. The gap was driven by: Leisure (₱500 over), Food (₱300 over)."

**Priority:** Must Have

---

### Feature 4: Recurring Expenses

**User Story:** As Juan, I want my Netflix and electric bill logged automatically so I don't forget to track them.

**Acceptance Criteria:**
- User can define recurring items: name, amount, category, payment method, frequency (monthly/weekly), due date
- System sends a push notification 1 day before due date: "Your electric bill (₱1,200) is due tomorrow"
- User can mark as paid (logs the expense) or snooze reminder
- Recurring items are listed in a dedicated section
- Unpaid recurring items are surfaced on the dashboard

**Priority:** Must Have

---

### Feature 5: Dashboard

**User Story:** As Juan, I want to open the app and immediately understand my financial health this month.

**Acceptance Criteria:**
- Dashboard shows: current month's total spend, savings gap status, budget health per category (compact view), upcoming recurring bills, recent transactions (last 5)
- All data loads from local cache; syncs with cloud in background
- Loads in under 1 second on a mid-range Android device

**Priority:** Must Have

---

### Feature 6: Charts & Insights

**User Story:** As Mia, I want to see a pie chart of where my money went so I can see my biggest expense category at a glance.

**Acceptance Criteria:**
- Pie/donut chart: spending breakdown by category for selected month
- Bar chart: monthly spend vs. budget (last 6 months)
- User can filter by month
- Charts animate on load
- Tapping a pie slice shows category details

**Priority:** Must Have

---

### Feature 7: Push Notifications

**User Story:** As Juan, I want a notification when I'm close to my food budget so I can slow down my spending.

**Acceptance Criteria:**
- Notification at 80% of any category budget: "⚠️ You've used 80% of your Food budget (₱2,400 of ₱3,000)"
- Notification at 100%: "🚨 Food budget exceeded. You're ₱200 over."
- Recurring bill reminder: 1 day before due date
- User can toggle notification types on/off in settings
- Respects device notification permissions

**Priority:** Must Have

---

### Feature 8 & 9: Offline-First + Cloud Sync

**User Story:** As Juan, I want to log expenses even when I'm on the MRT with no signal.

**Acceptance Criteria:**
- All create/edit/delete operations work without internet connection
- Local SQLite database as source of truth
- When connection is restored, local changes sync to cloud (Supabase)
- Conflict resolution: last-write-wins with timestamp
- Sync status indicator in settings ("Last synced: 2 mins ago")
- No data loss if app is closed during sync

**Priority:** Must Have

---

### Feature 10: PIN / Biometric Lock

**User Story:** As Mia, I want my financial data locked so my roommates can't see it.

**Acceptance Criteria:**
- User sets a 4–6 digit PIN on first launch
- Biometric auth (Face ID / fingerprint) as an alternative if device supports it
- App locks after 30 seconds in background (configurable)
- 5 failed PIN attempts triggers a 30-second cooldown
- PIN stored securely in device keychain (Expo SecureStore)

**Priority:** Must Have

---

## 7. Functional Requirements

### Expense Management
- CRUD operations for all expense records
- Soft delete (archive, not permanent) with ability to restore
- Expense search and filter by: category, date range, payment method, amount range
- Bulk delete for selected entries

### Categories
- 7 default categories with Filipino-relevant icons (pagkain 🍚, transpo 🚌, etc.)
- User can create custom categories with custom icon (from preset set) and color
- Categories cannot be deleted if they have linked expenses; must reassign first

### Budget System
- Monthly budget cycle (default: 1st–last of month; configurable to payroll date)
- Budget carryover option: unused budget carries to next month (opt-in)
- Budgets can be set for custom categories too

### Savings Gap Calculation
```
Savings Gap = Expected Savings − (Income − Total Expenses)
```
- Positive gap = you're saving more than expected ✓
- Negative gap = you're saving less than expected ✗

### Recurring Expenses
- Frequencies: daily, weekly, biweekly, monthly, annually
- When auto-logged, creates a standard expense record tagged as "recurring"
- User can edit/pause/delete recurring rules without affecting historical records

### Data Model (high-level)
```
User
  └── Profile (income mode, savings target, budget cycle start)
  └── Categories (id, name, icon, color, monthlyBudget)
  └── Expenses (id, amount, categoryId, merchant, notes, paymentMethod, date, isRecurring, syncedAt)
  └── RecurringRules (id, name, amount, categoryId, frequency, nextDueDate, isActive)
  └── IncomeRecords (id, amount, source, month, year)
```

---

## 8. Non-Functional Requirements

### Performance
- App cold start: ≤2 seconds on mid-range Android (Snapdragon 665+)
- Expense log entry: saved to local DB in ≤100ms
- Chart render: ≤500ms
- Background sync: does not block UI thread

### Security
- All financial data encrypted at rest (Expo SecureStore + SQLite encryption)
- Supabase Row Level Security (RLS): users can only access their own data
- No analytics SDK that transmits expense data to third parties
- PIN stored using expo-secure-store (not AsyncStorage)

### Offline Reliability
- 100% of core features work offline
- Sync queue persists across app restarts
- Zero data loss guarantee: operations write to local DB first, then sync

### Scalability (architecture-ready)
- Currency field present in DB schema from day 1 (defaults to "PHP")
- i18n-ready: strings externalized (react-i18next), not hardcoded
- Modular feature structure allows adding bank integrations later

### Accessibility
- Minimum AA contrast ratio (WCAG 2.1) for all text in both light and dark mode
- Touch targets ≥44×44pt
- Screen reader labels on all interactive elements
- Support for large text sizes (dynamic type)

### App Store Compliance
- No collection of financial account credentials
- Privacy policy required (data stored in Supabase)
- iOS: App Tracking Transparency not required (no ad tracking)

---

## 9. User Flows & Key Journeys

### Flow 1: First Launch (Onboarding)
```
Splash → Choose Income Mode (Salary / Mixed / Target) →
Set Savings Goal → Set Budget Cycle Start Date →
Create PIN → Enable Biometrics (optional) →
Enable Notifications (optional) → Dashboard
```

### Flow 2: Log an Expense (Primary Daily Action)
```
Dashboard → Tap "+" FAB →
Enter Amount (numpad) → Select Category →
Select Payment Method → Add Merchant/Notes (optional) →
Confirm → Back to Dashboard (expense visible immediately)
```

### Flow 3: Month-End Review
```
Dashboard → Tap "This Month" summary card →
View Savings Gap breakdown → View Category overspend list →
Tap Charts → Pie chart + Bar chart →
Reflect → Adjust budgets for next month
```

### Flow 4: Recurring Bill Due
```
Push Notification: "Electric bill due tomorrow (₱1,200)" →
Tap notification → App opens to recurring item →
Tap "Mark as Paid" → Expense auto-logged → Done
```

---

## 10. Technical Considerations & Recommended Stack

> Stack chosen to leverage your existing React.js skills and Windows-only development environment.

### Core Framework
| Layer | Technology | Reason |
|---|---|---|
| **Framework** | React Native + Expo (SDK 52+) | React.js skills transfer directly; Expo handles native APIs cleanly |
| **Build** | EAS Build (Expo Application Services) | Build iOS `.ipa` from Windows — no Mac required |
| **Navigation** | Expo Router (file-based) | Same mental model as Next.js App Router — natural for React devs |
| **Language** | TypeScript | Type safety for financial data; portfolio standard |

### UI & Styling
| Layer | Technology | Reason |
|---|---|---|
| **Component library** | Gluestack UI v3 | Copy-pasteable components built on NativeWind v5 (Tailwind CSS v4); full source ownership means deep pastel theme customization without fighting library defaults |
| **Styling engine** | NativeWind v5 (bundled with Gluestack) | Tailwind CSS v4 syntax — same mental model as React.js web dev; no separate install needed |
| **Theme tokens** | CSS variables in `global.css` | Define the Filipino pastel palette once; applies across all components in light and dark mode automatically |
| **Dark mode** | `GluestackUIProvider mode` prop | Single prop toggles light/dark; `dark:` Tailwind variant works out of the box via `prefers-color-scheme` |
| **Charts** | Victory Native XL | Best-in-class RN charts; smooth animations |
| **Icons** | Expo Vector Icons + custom SVG | Flexible icon system |
| **Animations** | React Native Reanimated 3 | Silky 60fps animations for transitions and chart renders; separate from Gluestack |

### Data & State
| Layer | Technology | Reason |
|---|---|---|
| **Local DB** | Expo SQLite (via drizzle-orm) | Offline-first; drizzle gives type-safe queries like an ORM |
| **Cloud DB** | Supabase (Postgres + RLS) | Free tier generous; built-in auth; great DX; portfolio-friendly |
| **State** | Zustand | Lightweight, React-idiomatic; easier than Redux for this scale |
| **Server sync** | TanStack Query (React Query) | Handles cache, background refetch, and optimistic updates |
| **Offline queue** | Custom sync queue in SQLite | Persist unsynced ops across app restarts |

### Auth & Security
| Layer | Technology | Reason |
|---|---|---|
| **Biometrics/PIN** | expo-local-authentication | Face ID, fingerprint, PIN fallback |
| **Secure storage** | expo-secure-store | Encrypted keychain/keystore storage |
| **Cloud identity** | Supabase anonymous auth | No email/password needed; device-linked identity for sync |

### Notifications & Device APIs
| Layer | Technology | Reason |
|---|---|---|
| **Push notifications** | Expo Notifications | Works on both platforms; EAS handles APNs/FCM certs |
| **Background tasks** | Expo Background Fetch | Sync and recurring checks while app is closed |

### Design System — Filipino Pastel Identity

Tokens are defined once in `global.css` and consumed by all Gluestack components via NativeWind's CSS variable system.

```css
/* global.css — GastosGo pastel theme */
@layer theme {
  :root {
    --primary:    244 162 97;   /* #F4A261 — warm sunset orange "Handa" */
    --secondary:  168 218 220;  /* #A8DADC — sea glass teal, Visayas ocean */
    --accent:     233 196 106;  /* #E9C46A — golden yellow "Kayamanan" */
    --background: 255 248 240;  /* #FFF8F0 — warm cream */
    --card:       255 236 210;  /* #FFECD2 — soft peach card surface */
    --foreground: 45 48 71;     /* #2D3047 — deep navy text */
    --destructive: 231 111 81;  /* #E76F51 — coral red */
    --muted:      129 178 154;  /* #81B29A — sage green (success/muted) */
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --background: 26 26 46;   /* #1A1A2E — deep navy */
      --card:       22 33 62;   /* #16213E — dark surface */
      --foreground: 232 232 232;/* #E8E8E8 — light text */
    }
  }
}
```
> These colors evoke the Philippine flag's warmth and tropical nature, translated into a modern pastel fintech aesthetic. All tokens are overridable per-component via `dark:` Tailwind variants.

### Folder Structure (Recommended)
```
gastosgo/
├── app/                    # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard
│   │   ├── expenses.tsx    # Expense list
│   │   ├── budgets.tsx     # Budget management
│   │   └── insights.tsx    # Charts
│   ├── modals/
│   │   ├── add-expense.tsx
│   │   └── add-recurring.tsx
│   └── onboarding/
├── components/             # Shared UI components
├── features/               # Feature modules (expenses, budgets, savings)
├── db/                     # Drizzle schema + migrations
├── stores/                 # Zustand stores
├── hooks/                  # Custom React hooks
├── lib/                    # Supabase client, sync logic
├── theme/                  # Colors, typography, spacing
└── utils/                  # Currency formatting, date helpers
```

---

## 11. Monetization & Business Model

**MVP Phase (Current):** Free, no monetization. Focused on portfolio demonstration.

**Future Phase Options:**
- **Freemium:** Free tier (3 months history, 5 categories); Premium (₱99/month) unlocks full history, unlimited categories, recurring rules, export
- **One-time purchase:** ₱299 lifetime unlock (accessible for Filipino market)
- **No ads:** Financial data privacy must be maintained; ad SDKs are incompatible with the trust model

---

## 12. Assumptions & Dependencies

### Assumptions
- Users have a smartphone with Android 10+ or iOS 16+
- Primary currency is Philippine Peso (PHP); multi-currency deferred
- Users are comfortable setting up a PIN on first launch
- Supabase free tier (500MB DB, 1GB bandwidth) is sufficient for MVP/portfolio
- EAS Free tier provides sufficient monthly builds for development

### Dependencies
- Supabase project (backend) — must be provisioned before cloud sync works
- EAS account — required for OTA updates and production builds
- Apple Developer Account (₱5,100/year) — only needed when publishing to App Store
- Google Play Developer Account ($25 one-time) — needed for Play Store publish

---

## 13. Open Questions

| # | Question | Impact | Decision Needed By |
|---|----------|--------|-------------------|
| 1 | Should budget cycle default to 1st of month or align with payroll date (e.g., 15th)? | UX for semi-monthly employees | Before onboarding build |
| 2 | Supabase anonymous auth vs. email auth — anonymous gives seamless UX but no account recovery if phone is lost | Data recovery risk | Before backend setup |
| 3 | Should the app support multiple "wallets" (Cash, GCash, BPI) as separate balances, or just track payment method as a tag? | Data model complexity | Before expense schema is finalized |
| 4 | Is a spending streak/gamification element (e.g., "7 days under budget 🔥") desired for engagement? | Scope creep risk | Post-MVP consideration |

---

## 14. Appendix

### Glossary
| Term | Definition |
|---|---|
| **Gastos** | Filipino: expense, spending, purchase |
| **Savings Gap** | Difference between expected and actual savings at a point in time |
| **Recurring Rule** | A predefined bill or subscription that triggers on a schedule |
| **Budget Cycle** | The monthly period for which budgets and savings goals are calculated |
| **Offline-First** | Architecture where local data is the source of truth; cloud is a sync target |
| **EAS** | Expo Application Services — cloud build and deployment for Expo apps |
| **RLS** | Row Level Security — Supabase's per-user data isolation mechanism |

### Competitor Reference
| App | What GastosGo does better |
|---|---|
| Monzo | Native Filipino context + offline-first (Monzo is UK-only, online-only) |
| Spendee | Simpler onboarding, no account required, PIN-only auth |
| YNAB | Free, mobile-first, no desktop required, Filipino cultural fit |
| GCash Savings | Tracks all payment methods (not just GCash), full budgeting system |

### Design References
- **Monzo** — card-based layout, clean transaction list, color-coded categories
- **Notion** — calm typography, generous whitespace
- **Maya (PayMaya)** — familiarity for Filipino users on fintech UX patterns
