
CREATE TABLE public.icp_staging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_full_name text,
  prospect_job_title text,
  prospect_company_name text,
  prospect_company_website text,
  prospect_linkedin_url text,
  prospect_city text,
  prospect_region text,
  prospect_country text,
  prospect_experience jsonb,
  prospect_skills jsonb,
  prospect_job_level_main text,
  prospect_job_department_main text,
  prospect_professional_email_hashed text,
  business_id text,
  brand text,
  icp_segment text,
  source text DEFAULT 'vibe_prospecting',
  source_date date DEFAULT CURRENT_DATE,
  vibe_prospect_id text UNIQUE,
  promoted boolean NOT NULL DEFAULT false,
  promoted_at timestamptz,
  skipped boolean NOT NULL DEFAULT false,
  skip_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.icp_staging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all icp_staging" ON public.icp_staging FOR ALL USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS icp_staging_linkedin_url_idx
  ON public.icp_staging (prospect_linkedin_url)
  WHERE prospect_linkedin_url IS NOT NULL;

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS icp_segment text,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_date date,
  ADD COLUMN IF NOT EXISTS vibe_prospect_id text,
  ADD COLUMN IF NOT EXISTS company_website text,
  ADD COLUMN IF NOT EXISTS verified_email text;
