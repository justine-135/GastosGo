-- FK indexes flagged by Supabase performance advisors
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories (user_id);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON public.expenses (user_id);
CREATE INDEX IF NOT EXISTS expenses_category_id_idx ON public.expenses (category_id);
CREATE INDEX IF NOT EXISTS recurring_rules_user_id_idx ON public.recurring_rules (user_id);
CREATE INDEX IF NOT EXISTS recurring_rules_category_id_idx ON public.recurring_rules (category_id);
