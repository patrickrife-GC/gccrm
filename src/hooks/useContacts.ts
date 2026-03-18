import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Contact } from "@/lib/types";

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      let allData: Contact[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .order("connected_on", { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        allData = allData.concat(data as Contact[]);
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return allData;
    },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Contact;
    },
    enabled: !!id,
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase
        .from("contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useBulkUpdateContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ops: { clearOld: boolean; featuredIds: string[]; date: string }) => {
      if (ops.clearOld) {
        const { error: clearErr } = await supabase
          .from("contacts")
          .update({ featured_today: false, featured_date: null })
          .eq("featured_today", true);
        if (clearErr) throw clearErr;
      }
      if (ops.featuredIds.length > 0) {
        const { error } = await supabase
          .from("contacts")
          .update({ featured_today: true, featured_date: ops.date })
          .in("id", ops.featuredIds);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
