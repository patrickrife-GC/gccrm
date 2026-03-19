
CREATE TABLE public.wa_contacts (
  jid text PRIMARY KEY,
  name text NOT NULL,
  sub text,
  groups text[] DEFAULT '{}',
  type text NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  responded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wa_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to wa_contacts" ON public.wa_contacts FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.validate_wa_contact()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.type NOT IN ('creator','va') THEN
    RAISE EXCEPTION 'Invalid wa_contact type: %', NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_wa_contact_before_upsert
  BEFORE INSERT OR UPDATE ON public.wa_contacts
  FOR EACH ROW EXECUTE FUNCTION public.validate_wa_contact();
