
-- Create threads table
CREATE TABLE public.threads (
  id text PRIMARY KEY,
  section text NOT NULL,
  title text NOT NULL,
  sub text,
  status text NOT NULL DEFAULT 'active',
  progress int NOT NULL DEFAULT 0,
  progress_note text,
  next_action text,
  tags text[] DEFAULT '{}',
  revenue text,
  notes text,
  last_touched timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to threads" ON public.threads FOR ALL USING (true) WITH CHECK (true);

-- Validation trigger for threads
CREATE OR REPLACE FUNCTION public.validate_thread()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status NOT IN ('active','done','pending','blocked','low') THEN
    RAISE EXCEPTION 'Invalid thread status: %', NEW.status;
  END IF;
  IF NEW.progress < 0 OR NEW.progress > 100 THEN
    RAISE EXCEPTION 'Progress must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_thread_before_upsert
  BEFORE INSERT OR UPDATE ON public.threads
  FOR EACH ROW EXECUTE FUNCTION public.validate_thread();

-- Create ideas table
CREATE TABLE public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  notes text,
  executed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to ideas" ON public.ideas FOR ALL USING (true) WITH CHECK (true);

-- Validation trigger for ideas
CREATE OR REPLACE FUNCTION public.validate_idea()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.type NOT IN ('podcast','agent','leadmag','prompt','tool') THEN
    RAISE EXCEPTION 'Invalid idea type: %', NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_idea_before_upsert
  BEFORE INSERT OR UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.validate_idea();
