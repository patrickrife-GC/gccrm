import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface IcpProspect {
  id: string;
  prospect_full_name: string | null;
  prospect_job_title: string | null;
  prospect_company_name: string | null;
  prospect_company_website: string | null;
  prospect_linkedin_url: string | null;
  prospect_city: string | null;
  prospect_region: string | null;
  prospect_country: string | null;
  prospect_experience: any;
  prospect_skills: any;
  prospect_job_level_main: string | null;
  prospect_job_department_main: string | null;
  prospect_professional_email_hashed: string | null;
  business_id: string | null;
  brand: string | null;
  icp_segment: string | null;
  source: string | null;
  source_date: string | null;
  vibe_prospect_id: string | null;
  promoted: boolean;
  promoted_at: string | null;
  skipped: boolean;
  skip_reason: string | null;
  created_at: string;
}

export function useIcpStaging() {
  return useQuery({
    queryKey: ["icp_staging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("icp_staging" as any)
        .select("*")
        .eq("promoted", false)
        .eq("skipped", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as IcpProspect[];
    },
  });
}

export function useIcpStagingAll() {
  return useQuery({
    queryKey: ["icp_staging_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("icp_staging" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as IcpProspect[];
    },
  });
}

export function usePromoteProspect() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prospect: IcpProspect) => {
      // Insert into contacts
      const { error: insertErr } = await supabase.from("contacts").insert({
        full_name: prospect.prospect_full_name,
        title: prospect.prospect_job_title,
        company: prospect.prospect_company_name,
        company_website: prospect.prospect_company_website,
        linkedin_url: prospect.prospect_linkedin_url,
        industry_cluster: prospect.prospect_job_level_main,
        icp_segment: prospect.icp_segment,
        source: "vibe_prospecting",
        source_date: prospect.source_date,
        vibe_prospect_id: prospect.vibe_prospect_id,
      } as any);
      if (insertErr) throw insertErr;

      // Mark promoted
      const { error: updateErr } = await supabase
        .from("icp_staging" as any)
        .update({ promoted: true, promoted_at: new Date().toISOString() } as any)
        .eq("id", prospect.id);
      if (updateErr) throw updateErr;

      return prospect;
    },
    onMutate: async (prospect) => {
      await qc.cancelQueries({ queryKey: ["icp_staging"] });
      const prev = qc.getQueryData<IcpProspect[]>(["icp_staging"]);
      qc.setQueryData<IcpProspect[]>(["icp_staging"], (old) =>
        (old ?? []).filter((p) => p.id !== prospect.id)
      );
      return { prev };
    },
    onError: (_err, _prospect, context: any) => {
      if (context?.prev) qc.setQueryData(["icp_staging"], context.prev);
    },
    onSuccess: (prospect) => {
      toast({
        title: `${prospect.prospect_full_name} added to CRM — outreach assigned automatically`,
      });
      qc.invalidateQueries({ queryKey: ["icp_staging"] });
      qc.invalidateQueries({ queryKey: ["icp_staging_all"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useSkipProspect() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, skip_reason }: { id: string; skip_reason: string }) => {
      const { error } = await supabase
        .from("icp_staging" as any)
        .update({ skipped: true, skip_reason } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ["icp_staging"] });
      const prev = qc.getQueryData<IcpProspect[]>(["icp_staging"]);
      qc.setQueryData<IcpProspect[]>(["icp_staging"], (old) =>
        (old ?? []).filter((p) => p.id !== id)
      );
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.prev) qc.setQueryData(["icp_staging"], context.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["icp_staging"] });
      qc.invalidateQueries({ queryKey: ["icp_staging_all"] });
    },
  });
}
