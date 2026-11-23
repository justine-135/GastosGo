ALTER TABLE public.recurring_rules ADD COLUMN recurrence_day integer NOT NULL DEFAULT 1;
ALTER TABLE public.recurring_rules ADD COLUMN behaviour text NOT NULL DEFAULT 'remind_me';
