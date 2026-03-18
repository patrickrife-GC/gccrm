export interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  linkedin_url: string | null;
  email: string | null;
  company: string | null;
  title: string | null;
  connected_on: string | null;
  industry_cluster: string | null;
  influence_score: number | null;
  notes: string | null;
  last_contacted: string | null;
  skip_until: string | null;
  featured_today: boolean;
  featured_date: string | null;
  next_action_date: string | null;
  outreach_intent: string[] | null;
  suggested_outreach_type: string | null;
  outreach_angle: string | null;
  suggested_message: string | null;
  created_at: string;
  updated_at: string;
}
