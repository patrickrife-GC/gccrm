ALTER TABLE public.contacts ADD COLUMN outreach_angle text;

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

  -- Auto-assign suggested_outreach_type
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

  -- Auto-assign outreach_angle
  IF 'ground_control' = ANY(intents) THEN
    IF lower_title ~ '(founder|ceo|co-founder|owner)' THEN
      NEW.outreach_angle := 'podcast_guest';
    ELSIF lower_title ~ '(vp|director|head|chief|senior|partner|president|managing)' THEN
      NEW.outreach_angle := 'services_intro';
    ELSE
      NEW.outreach_angle := 'newsletter_feature';
    END IF;
  ELSIF 'ideoloop' = ANY(intents) THEN
    IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url != '' THEN
      NEW.outreach_angle := 'content_amplification';
    ELSE
      NEW.outreach_angle := 'story_to_content';
    END IF;
  ELSIF 'baltimore_creators' = ANY(intents) THEN
    NEW.outreach_angle := 'event_invite';
  ELSE
    NEW.outreach_angle := NULL;
  END IF;

  RETURN NEW;
END;
$$;