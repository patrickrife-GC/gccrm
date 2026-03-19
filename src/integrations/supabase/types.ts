export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          company: string | null
          company_website: string | null
          connected_on: string | null
          created_at: string
          desired_outcome: string | null
          email: string | null
          featured_date: string | null
          featured_today: boolean
          first_name: string | null
          full_name: string | null
          gc_outreach_type: string | null
          icp_segment: string | null
          id: string
          industry_cluster: string | null
          influence_score: number | null
          last_contacted: string | null
          last_name: string | null
          linkedin_url: string | null
          next_action_date: string | null
          notes: string | null
          outreach_angle: string | null
          outreach_intent: string[] | null
          skip_until: string | null
          source: string | null
          source_date: string | null
          suggested_message: string | null
          suggested_outreach_type: string | null
          title: string | null
          updated_at: string
          verified_email: string | null
          vibe_prospect_id: string | null
        }
        Insert: {
          company?: string | null
          company_website?: string | null
          connected_on?: string | null
          created_at?: string
          desired_outcome?: string | null
          email?: string | null
          featured_date?: string | null
          featured_today?: boolean
          first_name?: string | null
          full_name?: string | null
          gc_outreach_type?: string | null
          icp_segment?: string | null
          id?: string
          industry_cluster?: string | null
          influence_score?: number | null
          last_contacted?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          next_action_date?: string | null
          notes?: string | null
          outreach_angle?: string | null
          outreach_intent?: string[] | null
          skip_until?: string | null
          source?: string | null
          source_date?: string | null
          suggested_message?: string | null
          suggested_outreach_type?: string | null
          title?: string | null
          updated_at?: string
          verified_email?: string | null
          vibe_prospect_id?: string | null
        }
        Update: {
          company?: string | null
          company_website?: string | null
          connected_on?: string | null
          created_at?: string
          desired_outcome?: string | null
          email?: string | null
          featured_date?: string | null
          featured_today?: boolean
          first_name?: string | null
          full_name?: string | null
          gc_outreach_type?: string | null
          icp_segment?: string | null
          id?: string
          industry_cluster?: string | null
          influence_score?: number | null
          last_contacted?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          next_action_date?: string | null
          notes?: string | null
          outreach_angle?: string | null
          outreach_intent?: string[] | null
          skip_until?: string | null
          source?: string | null
          source_date?: string | null
          suggested_message?: string | null
          suggested_outreach_type?: string | null
          title?: string | null
          updated_at?: string
          verified_email?: string | null
          vibe_prospect_id?: string | null
        }
        Relationships: []
      }
      icp_staging: {
        Row: {
          brand: string | null
          business_id: string | null
          created_at: string | null
          icp_segment: string | null
          id: string
          promoted: boolean
          promoted_at: string | null
          prospect_city: string | null
          prospect_company_name: string | null
          prospect_company_website: string | null
          prospect_country: string | null
          prospect_experience: Json | null
          prospect_full_name: string | null
          prospect_job_department_main: string | null
          prospect_job_level_main: string | null
          prospect_job_title: string | null
          prospect_linkedin_url: string | null
          prospect_professional_email_hashed: string | null
          prospect_region: string | null
          prospect_skills: Json | null
          skip_reason: string | null
          skipped: boolean
          source: string | null
          source_date: string | null
          vibe_prospect_id: string | null
        }
        Insert: {
          brand?: string | null
          business_id?: string | null
          created_at?: string | null
          icp_segment?: string | null
          id?: string
          promoted?: boolean
          promoted_at?: string | null
          prospect_city?: string | null
          prospect_company_name?: string | null
          prospect_company_website?: string | null
          prospect_country?: string | null
          prospect_experience?: Json | null
          prospect_full_name?: string | null
          prospect_job_department_main?: string | null
          prospect_job_level_main?: string | null
          prospect_job_title?: string | null
          prospect_linkedin_url?: string | null
          prospect_professional_email_hashed?: string | null
          prospect_region?: string | null
          prospect_skills?: Json | null
          skip_reason?: string | null
          skipped?: boolean
          source?: string | null
          source_date?: string | null
          vibe_prospect_id?: string | null
        }
        Update: {
          brand?: string | null
          business_id?: string | null
          created_at?: string | null
          icp_segment?: string | null
          id?: string
          promoted?: boolean
          promoted_at?: string | null
          prospect_city?: string | null
          prospect_company_name?: string | null
          prospect_company_website?: string | null
          prospect_country?: string | null
          prospect_experience?: Json | null
          prospect_full_name?: string | null
          prospect_job_department_main?: string | null
          prospect_job_level_main?: string | null
          prospect_job_title?: string | null
          prospect_linkedin_url?: string | null
          prospect_professional_email_hashed?: string | null
          prospect_region?: string | null
          prospect_skills?: Json | null
          skip_reason?: string | null
          skipped?: boolean
          source?: string | null
          source_date?: string | null
          vibe_prospect_id?: string | null
        }
        Relationships: []
      }
      ideas: {
        Row: {
          created_at: string
          executed: boolean
          id: string
          notes: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          executed?: boolean
          id?: string
          notes?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          executed?: boolean
          id?: string
          notes?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          created_at: string
          id: string
          last_touched: string
          next_action: string | null
          notes: string | null
          progress: number
          progress_note: string | null
          revenue: string | null
          section: string
          status: string
          sub: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          id: string
          last_touched?: string
          next_action?: string | null
          notes?: string | null
          progress?: number
          progress_note?: string | null
          revenue?: string | null
          section: string
          status?: string
          sub?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          last_touched?: string
          next_action?: string | null
          notes?: string | null
          progress?: number
          progress_note?: string | null
          revenue?: string | null
          section?: string
          status?: string
          sub?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      wa_contacts: {
        Row: {
          created_at: string
          groups: string[] | null
          jid: string
          name: string
          responded: boolean
          sent: boolean
          sub: string | null
          type: string
        }
        Insert: {
          created_at?: string
          groups?: string[] | null
          jid: string
          name: string
          responded?: boolean
          sent?: boolean
          sub?: string | null
          type: string
        }
        Update: {
          created_at?: string
          groups?: string[] | null
          jid?: string
          name?: string
          responded?: boolean
          sent?: boolean
          sub?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
