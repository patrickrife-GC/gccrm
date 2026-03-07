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
  created_at: string;
  updated_at: string;
}
