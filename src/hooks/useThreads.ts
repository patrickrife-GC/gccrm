import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_THREADS } from "@/lib/threadTypes";
import type { Thread } from "@/lib/threadTypes";
import { useEffect, useRef } from "react";

export function useThreads() {
  const seeded = useRef(false);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("threads")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Thread[];
    },
  });

  useEffect(() => {
    if (seeded.current || query.isLoading || !query.data) return;
    if (query.data.length === 0) {
      seeded.current = true;
      const rows = DEFAULT_THREADS.map((t) => ({ ...t }));
      supabase
        .from("threads")
        .insert(rows)
        .then(({ error }) => {
          if (!error) queryClient.invalidateQueries({ queryKey: ["threads"] });
        });
    }
  }, [query.data, query.isLoading, queryClient]);

  return query;
}

export function useUpdateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Thread> & { id: string }) => {
      const { data, error } = await supabase
        .from("threads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["threads"] }),
  });
}

export function useTouchThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("threads")
        .update({ last_touched: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["threads"] }),
  });
}
