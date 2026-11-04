-- BE-02: Mirror tables for all synced entities
-- BE-03: RLS policies (appended below)

-- users: thin mirror; the canonical identity is auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  income_mode        text NOT NULL DEFAULT 'salary',
  savings_target     numeric,
  budget_cycle_start integer NOT NULL DEFAULT 1,
  currency           text NOT NULL DEFAULT 'PHP',
  expo_push_token    text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id             uuid PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  icon           text,
  color          text,
  monthly_budget numeric NOT NULL DEFAULT 0,
  currency       text NOT NULL DEFAULT 'PHP',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id               uuid PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount           numeric NOT NULL,
  category_id      uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  merchant         text,
  notes            text,
  payment_method   text,
  date             text NOT NULL,
  is_recurring     boolean NOT NULL DEFAULT false,
  recurring_rule_id uuid,
  synced_at        timestamptz,
  currency         text NOT NULL DEFAULT 'PHP',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- recurring_rules
CREATE TABLE IF NOT EXISTS public.recurring_rules (
  id            uuid PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  amount        numeric NOT NULL,
  category_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  frequency     text NOT NULL,
  next_due_date text NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- income_records
CREATE TABLE IF NOT EXISTS public.income_records (
  id         uuid PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     numeric NOT NULL,
  source     text NOT NULL,
  month      integer NOT NULL,
  year       integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, source, month, year)
);

-- budget_alerts_sent (BE-08)
CREATE TABLE IF NOT EXISTS public.budget_alerts_sent (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL,
  threshold   integer NOT NULL,  -- 80 or 100
  month       integer NOT NULL,
  year        integer NOT NULL,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, threshold, month, year)
);

-- ============================================================
-- BE-03: Row Level Security
-- ============================================================

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts_sent ENABLE ROW LEVEL SECURITY;

-- Helper macro repeated per table: auth.uid() = user_id

-- users
CREATE POLICY "users_select" ON public.users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete" ON public.users FOR DELETE USING (auth.uid() = user_id);

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- categories
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- expenses
CREATE POLICY "expenses_select" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- recurring_rules
CREATE POLICY "recurring_rules_select" ON public.recurring_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recurring_rules_insert" ON public.recurring_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recurring_rules_update" ON public.recurring_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recurring_rules_delete" ON public.recurring_rules FOR DELETE USING (auth.uid() = user_id);

-- income_records
CREATE POLICY "income_records_select" ON public.income_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "income_records_insert" ON public.income_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "income_records_update" ON public.income_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "income_records_delete" ON public.income_records FOR DELETE USING (auth.uid() = user_id);

-- budget_alerts_sent
CREATE POLICY "budget_alerts_select" ON public.budget_alerts_sent FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budget_alerts_insert" ON public.budget_alerts_sent FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_alerts_update" ON public.budget_alerts_sent FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "budget_alerts_delete" ON public.budget_alerts_sent FOR DELETE USING (auth.uid() = user_id);
