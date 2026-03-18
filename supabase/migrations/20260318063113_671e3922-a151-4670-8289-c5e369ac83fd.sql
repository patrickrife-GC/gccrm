CREATE OR REPLACE FUNCTION public.assign_outreach_intent()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  intents text[] := '{}';
  lower_title text := lower(COALESCE(NEW.title, ''));
  lower_company text := lower(COALESCE(NEW.company, ''));
  lower_cluster text := lower(COALESCE(NEW.industry_cluster, ''));
BEGIN
  -- Founder rule: add ground_control + ideoloop
  IF lower_cluster = 'founder' THEN
    intents := array_append(intents, 'ground_control');
    intents := array_append(intents, 'ideoloop');
  END IF;

  -- Product/Engineer/Builder rule: add ideoloop
  IF lower_title ~ '(product|engineer|builder)' AND NOT 'ideoloop' = ANY(intents) THEN
    intents := array_append(intents, 'ideoloop');
  END IF;

  -- Creator/marketing/media rule: add ground_control
  IF (lower_title ~ '(creator|creative|marketing|media|content|brand|design|editor|producer|writer|journalist|influencer|community)'
      OR lower_company ~ '(creator|creative|marketing|media|content|brand|studio|agency|production)')
     AND NOT 'ground_control' = ANY(intents) THEN
    intents := array_append(intents, 'ground_control');
  END IF;

  NEW.outreach_intent := intents;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assign_outreach_intent
  BEFORE INSERT OR UPDATE OF industry_cluster, title, company
  ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_outreach_intent();