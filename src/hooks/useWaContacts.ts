import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export interface WaContact {
  jid: string;
  name: string;
  sub: string | null;
  groups: string[];
  type: string;
  sent: boolean;
  responded: boolean;
  created_at: string;
}

const DEFAULT_WA_CONTACTS: Omit<WaContact, "created_at">[] = [
  { jid: "82940197351500", name: "Adam Levinter", sub: "Creator", groups: ["LLF", "MON"], type: "creator", sent: false, responded: false },
  { jid: "215804977119465", name: "Asim Khaliq", sub: "Creator", groups: ["APX", "WCG", "MON"], type: "creator", sent: false, responded: false },
  { jid: "56049843347664", name: "Salma Khatun", sub: "Creator", groups: ["APX"], type: "creator", sent: false, responded: false },
  { jid: "31035551158349", name: "Ananya Banerjee", sub: "Creator", groups: ["LLF"], type: "creator", sent: false, responded: false },
  { jid: "115427766202390", name: "Susanne Ekstroem", sub: "Creator", groups: ["2-20K"], type: "creator", sent: false, responded: false },
  { jid: "203749104554067", name: "Peter Wong", sub: "Creator", groups: ["2-20K"], type: "creator", sent: false, responded: false },
  { jid: "113043606397011", name: "Patrick Chataignier", sub: "Creator", groups: ["WCG"], type: "creator", sent: false, responded: false },
  { jid: "148713393631478", name: "Sandra Pellumbi", sub: "Creator", groups: ["WCG"], type: "creator", sent: false, responded: false },
  { jid: "31371095482414", name: "Kandis D.", sub: "Creator", groups: ["WCG"], type: "creator", sent: false, responded: false },
  { jid: "151698345603287", name: "Creator (Nathan)", sub: "Creator", groups: ["MON"], type: "creator", sent: false, responded: false },
  { jid: "22940024348716", name: "Creator", sub: "Creator", groups: ["APX", "PST", "2-20K"], type: "creator", sent: false, responded: false },
  { jid: "251818261119021", name: "Creator (Davy)", sub: "Creator", groups: ["APX"], type: "creator", sent: false, responded: false },
  { jid: "22948228366581", name: "Creator (Gavriel)", sub: "Creator", groups: ["APX"], type: "creator", sent: false, responded: false },
  { jid: "43770145935463", name: "Creator (Luis)", sub: "Creator", groups: ["APX", "PST", "2-20K"], type: "creator", sent: false, responded: false },
  { jid: "220280534335590", name: "Creator (Kerim Furi)", sub: "Creator", groups: ["APX"], type: "creator", sent: false, responded: false },
  { jid: "172378529239235", name: "Creator (Ajay Devalia)", sub: "Creator", groups: ["APX"], type: "creator", sent: false, responded: false },
  { jid: "95868434809059", name: "Creator (Jarrod)", sub: "Creator", groups: ["APX"], type: "creator", sent: false, responded: false },
  { jid: "273490682896508", name: "Creator (Alex S.)", sub: "Creator", groups: ["2-20K"], type: "creator", sent: false, responded: false },
  { jid: "29747060953131", name: "VA", sub: "for Benjamin Bargetzi", groups: ["LLF"], type: "va", sent: false, responded: false },
  { jid: "72400431501396", name: "VA", sub: "for Harvey Lee", groups: ["LLF"], type: "va", sent: false, responded: false },
  { jid: "152479979331722", name: "VA", sub: "for Klaudia Slosarova", groups: ["LLF"], type: "va", sent: false, responded: false },
  { jid: "249971861409832", name: "VA", sub: "for Johnny Nel", groups: ["LLF"], type: "va", sent: false, responded: false },
  { jid: "193823451934955", name: "VA", sub: "for Ben Gioia", groups: ["APX"], type: "va", sent: false, responded: false },
  { jid: "82223927705687", name: "VA", sub: "for Shane Barker", groups: ["APX"], type: "va", sent: false, responded: false },
  { jid: "34303954141311", name: "VA", sub: "for Michael Tatham", groups: ["APX", "PST"], type: "va", sent: false, responded: false },
  { jid: "221693477929037", name: "VA", sub: "for Michael Shen", groups: ["APX"], type: "va", sent: false, responded: false },
  { jid: "144873894191129", name: "VA", sub: "for Dr. Neetu Johnson", groups: ["APX"], type: "va", sent: false, responded: false },
  { jid: "237005489307793", name: "VA", sub: "for Connor Gillivan", groups: ["APX", "PST"], type: "va", sent: false, responded: false },
  { jid: "261396608634920", name: "VA", sub: "for Marco Franzo", groups: ["APX", "2-20K", "WCG"], type: "va", sent: false, responded: false },
  { jid: "243400594948351", name: "VA", sub: "for Jeremy Prasetyo", groups: ["APX"], type: "va", sent: false, responded: false },
  { jid: "108740116218013", name: "VA", sub: "for Mariya Valeva", groups: ["APX"], type: "va", sent: false, responded: false },
  { jid: "103217090322671", name: "VA (Khushi)", sub: "for Ike Affam / others", groups: ["WCG"], type: "va", sent: false, responded: false },
  { jid: "83752516603931", name: "VA (Dimple)", sub: "for David Citron", groups: ["WCG"], type: "va", sent: false, responded: false },
  { jid: "87390337163460", name: "VA (Aakash)", sub: "for Nathan Greenhut", groups: ["WCG"], type: "va", sent: false, responded: false },
  { jid: "97440577409117", name: "VA", sub: "for Fede Vargas", groups: ["MON"], type: "va", sent: false, responded: false },
];

export function useWaContacts() {
  const seeded = useRef(false);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["wa_contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wa_contacts")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as WaContact[];
    },
  });

  useEffect(() => {
    if (seeded.current || query.isLoading || !query.data) return;
    if (query.data.length === 0) {
      seeded.current = true;
      supabase
        .from("wa_contacts")
        .insert(DEFAULT_WA_CONTACTS.map((c) => ({ ...c })))
        .then(({ error }) => {
          if (!error) queryClient.invalidateQueries({ queryKey: ["wa_contacts"] });
        });
    }
  }, [query.data, query.isLoading, queryClient]);

  return query;
}

export function useUpdateWaContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jid, ...updates }: Partial<WaContact> & { jid: string }) => {
      const { data, error } = await supabase
        .from("wa_contacts")
        .update(updates)
        .eq("jid", jid)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wa_contacts"] }),
  });
}

export function useCreateWaContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: { jid: string; name: string; sub?: string; groups: string[]; type: string }) => {
      const { data, error } = await supabase
        .from("wa_contacts")
        .insert(contact)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wa_contacts"] }),
  });
}
