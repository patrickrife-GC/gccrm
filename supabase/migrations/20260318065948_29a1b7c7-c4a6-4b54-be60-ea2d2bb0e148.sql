
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

  -- Auto-assign gc_outreach_type (only for ground_control)
  IF 'ground_control' = ANY(intents) THEN
    -- Speaking: event/conference/community organizers, or founders with audience/platform signals
    IF lower_title ~ '(event|conference|community|organizer|summit|meetup|curator|host)' THEN
      NEW.gc_outreach_type := 'speaking';
    ELSIF lower_title ~ '(founder|ceo|co-founder|owner)' AND (
      lower_company ~ '(media|podcast|newsletter|community|network|collective|club|forum|hub|guild|society|association|group|platform|audience)'
      OR lower_title ~ '(host|speaker|keynote|evangelist|advocate|ambassador|thought leader)'
    ) THEN
      NEW.gc_outreach_type := 'speaking';
    ELSIF lower_title ~ '(speaker|keynote|evangelist|advocate|ambassador|thought leader|podcaster|host)' THEN
      NEW.gc_outreach_type := 'speaking';
    ELSIF lower_company ~ '(podcast|newsletter|media|community|network|collective|club|forum|hub)' THEN
      NEW.gc_outreach_type := 'speaking';
    -- Previous logic
    ELSIF lower_title ~ '(founder|ceo|co-founder|owner)' THEN
      NEW.gc_outreach_type := 'ghostwriting';
    ELSIF lower_title ~ '(marketing|growth|demand|acquisition|brand)' THEN
      NEW.gc_outreach_type := 'social_growth';
    ELSIF lower_company ~ '(startup|labs|ventures|studio|early|pre-seed|seed|incubator|accelerator)' OR lower_cluster = 'founder' THEN
      NEW.gc_outreach_type := 'website';
    ELSIF lower_company ~ '(saas|b2b|software|platform|cloud|enterprise|tech|fintech|healthtech|edtech|martech|devtools)' OR lower_title ~ '(saas|b2b|enterprise|platform)' THEN
      NEW.gc_outreach_type := 'outbound_strategy';
    ELSIF lower_title ~ '(partner|alliance|channel|ecosystem|bd|business development)' THEN
      NEW.gc_outreach_type := 'partnership';
    ELSE
      NEW.gc_outreach_type := 'general_services';
    END IF;
  ELSE
    NEW.gc_outreach_type := NULL;
  END IF;

  -- Auto-assign suggested_message
  IF 'ground_control' = ANY(intents) THEN
    CASE NEW.gc_outreach_type
      WHEN 'ghostwriting' THEN
        NEW.suggested_message := 'Been following what you''re building — curious if you''ve thought about documenting your thinking more consistently. I''ve been helping founders do that without adding time to their plate.';
      WHEN 'social_growth' THEN
        NEW.suggested_message := 'Looks like you''re doing some interesting work — are you intentionally using content to drive inbound right now?';
      WHEN 'website' THEN
        NEW.suggested_message := 'Quick question — are you happy with how your current site converts or tells your story?';
      WHEN 'lead_gen' THEN
        NEW.suggested_message := 'Curious how you''re currently generating pipeline — mostly inbound or outbound right now?';
      WHEN 'outbound_strategy' THEN
        NEW.suggested_message := 'I''ve been seeing a lot of teams struggle with outbound lately — is that something you''re actively running or exploring?';
      WHEN 'speaking' THEN
        NEW.suggested_message := 'Your perspective would resonate — have you thought about doing more speaking or guest appearances?';
      WHEN 'partnership' THEN
        NEW.suggested_message := 'I think there could be some interesting overlap in what we''re each building — open to exploring a collaboration?';
      ELSE
        NEW.suggested_message := 'Been following what you''re building — curious what your current focus is on growth and content right now.';
    END CASE;
  ELSE
    CASE NEW.outreach_angle
      WHEN 'story_to_content' THEN
        NEW.suggested_message := 'You''ve got a lot of great stories in what you''re building — have you ever thought about turning those into content just by talking through them?';
      WHEN 'content_amplification' THEN
        NEW.suggested_message := 'You''re already sharing great ideas — I think we could help you turn that into a consistent content engine.';
      WHEN 'event_invite' THEN
        NEW.suggested_message := 'We''re building a group of founders/creators locally — would love to have you at the next Baltimore Creators session.';
      ELSE
        NEW.suggested_message := NULL;
    END CASE;
  END IF;

  RETURN NEW;
END;
$$;
