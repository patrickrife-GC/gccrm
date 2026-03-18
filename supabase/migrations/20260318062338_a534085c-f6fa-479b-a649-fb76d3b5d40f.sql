ALTER TABLE public.contacts ADD COLUMN featured_today boolean NOT NULL DEFAULT false;
ALTER TABLE public.contacts ADD COLUMN featured_date date;