ALTER TABLE public.contacts ADD COLUMN suggested_outreach_type text;

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
  outreach_options text[] := '{}';
  random_idx int;
BEGIN
  -- Founder rule
  IF lower_cluster = 'founder' THEN
    intents := array_append(intents, 'ground_control');
    intents := array_append(intents, 'ideoloop');
  END IF;

  -- Product/Engineer/Builder rule
  IF lower_title ~ '(product|engineer|builder)' AND NOT 'ideoloop' = ANY(intents) THEN
    intents := array_append(intents, 'ideoloop');
  END IF;

  -- Creator/marketing/media rule
  IF (lower_title ~ '(creator|creative|marketing|media|content|brand|design|editor|producer|writer|journalist|influencer|community)'
      OR lower_company ~ '(creator|creative|marketing|media|content|brand|studio|agency|production)')
     AND NOT 'ground_control' = ANY(intents) THEN
    intents := array_append(intents, 'ground_control');
  END IF;

  NEW.outreach_intent := intents;

  -- Auto-assign suggested_outreach_type based on first intent
  IF 'ground_control' = ANY(intents) THEN
    outreach_options := ARRAY['invite to podcast', 'share insight', 'ask a question'];
  ELSIF 'ideoloop' = ANY(intents) THEN
    outreach_options := ARRAY['product feedback', 'builder conversation', 'early access'];
  ELSIF 'baltimore_creators' = ANY(intents) THEN
    outreach_options := ARRAY['event invite', 'local intro', 'meetup conversation'];
  END IF;

  IF array_length(outreach_options, 1) > 0 THEN
    random_idx := 1 + floor(random() * array_length(outreach_options, 1))::int;
    NEW.suggested_outreach_type := outreach_options[random_idx];
  ELSE
    NEW.suggested_outreach_type := NULL;
  END IF;

  RETURN NEW;
END;
$$;