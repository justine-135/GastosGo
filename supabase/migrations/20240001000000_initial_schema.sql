-- users mirror (id = local generateId, supabase_id = auth.users UUID)
CREATE TABLE IF NOT EXISTS public.users (
  id          text PRIMARY KEY,
  supabase_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- profiles (user_id is PK, 1:1 with auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  income_mode        text NOT NULL DEFAULT 'salary',
  monthly_salary     numeric,
  savings_target     numeric NOT NULL DEFAULT 0,
  budget_cycle_start integer NOT NULL DEFAULT 1,
  currency           text NOT NULL DEFAULT 'PHP',
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- categories (user_id nullable = system default visible to all)
CREATE TABLE IF NOT EXISTS public.categories (
  id                text PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name              text NOT NULL,
  icon              text NOT NULL,
  color             text NOT NULL,
  monthly_budget    numeric NOT NULL DEFAULT 0,
  currency          text NOT NULL DEFAULT 'PHP',
  carryover_enabled boolean NOT NULL DEFAULT false,
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id                text PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount            numeric NOT NULL,
  category_id       text REFERENCES public.categories(id) ON DELETE SET NULL,
  merchant          text,
  notes             text,
  payment_method    text NOT NULL,
  date              text NOT NULL,
  is_recurring      boolean NOT NULL DEFAULT false,
  recurring_rule_id text,
  synced_at         timestamptz,
  currency          text NOT NULL DEFAULT 'PHP',
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- recurring_rules
CREATE TABLE IF NOT EXISTS public.recurring_rules (
  id             text PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  amount         numeric NOT NULL,
  category_id    text REFERENCES public.categories(id) ON DELETE SET NULL,
  frequency      text NOT NULL,
  next_due_date  text NOT NULL,
  is_active      boolean NOT NULL DEFAULT true,
  payment_method text NOT NULL DEFAULT 'Cash',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- income_records
CREATE TABLE IF NOT EXISTS public.income_records (
  id         text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     numeric NOT NULL,
  source     text NOT NULL,
  month      integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year       integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, source, month, year)
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records  ENABLE ROW LEVEL SECURITY;

-- users (keyed on supabase_id, not user_id)
CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated USING ((SELECT auth.uid()) = supabase_id);
CREATE POLICY "users_insert" ON public.users FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = supabase_id);
CREATE POLICY "users_update" ON public.users FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = supabase_id) WITH CHECK ((SELECT auth.uid()) = supabase_id);
CREATE POLICY "users_delete" ON public.users FOR DELETE TO authenticated USING ((SELECT auth.uid()) = supabase_id);

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- categories
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated USING (user_id IS NULL OR (SELECT auth.uid()) = user_id);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "categories_update" ON public.categories FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "categories_delete" ON public.categories FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- expenses
CREATE POLICY "expenses_select" ON public.expenses FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- recurring_rules
CREATE POLICY "recurring_rules_select" ON public.recurring_rules FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "recurring_rules_insert" ON public.recurring_rules FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "recurring_rules_update" ON public.recurring_rules FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "recurring_rules_delete" ON public.recurring_rules FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- income_records
CREATE POLICY "income_records_select" ON public.income_records FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "income_records_insert" ON public.income_records FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "income_records_update" ON public.income_records FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "income_records_delete" ON public.income_records FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
