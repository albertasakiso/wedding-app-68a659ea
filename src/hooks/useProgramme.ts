import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProgrammeSection { id: string; key: string; title: string; enabled: boolean; order_index: number }
export interface ProgrammeFunctionary { id: string; group_key: string; name: string; affiliation: string | null; order_index: number }
export interface ProgrammeOrderItem { id: string; item: string; led_by: string | null; order_index: number }
export interface ProgrammeHymn { id: string; title: string; reference: string | null; author: string | null; lyrics: string | null; order_index: number }
export interface ProgrammePhoto { id: string; category: string; label: string; order_index: number }
export interface ProgrammeCredit { id: string; role: string; name: string; phone: string | null; order_index: number }
export interface ProgrammeThankYou { id: string; body: string; verse_reference: string | null; verse_text: string | null }

export interface ProgrammeData {
  sections: ProgrammeSection[];
  functionaries: ProgrammeFunctionary[];
  orderOfService: ProgrammeOrderItem[];
  hymns: ProgrammeHymn[];
  photography: ProgrammePhoto[];
  credits: ProgrammeCredit[];
  thankYou: ProgrammeThankYou | null;
}

async function fetchProgramme(): Promise<ProgrammeData> {
  const [s, f, o, h, p, c, t] = await Promise.all([
    supabase.from("programme_sections").select("*").order("order_index"),
    supabase.from("programme_functionaries").select("*").order("order_index"),
    supabase.from("programme_order_of_service").select("*").order("order_index"),
    supabase.from("programme_hymns").select("*").order("order_index"),
    supabase.from("programme_photography").select("*").order("order_index"),
    supabase.from("programme_credits").select("*").order("order_index"),
    supabase.from("programme_thank_you").select("*").limit(1).maybeSingle(),
  ]);
  return {
    sections: (s.data as any) || [],
    functionaries: (f.data as any) || [],
    orderOfService: (o.data as any) || [],
    hymns: (h.data as any) || [],
    photography: (p.data as any) || [],
    credits: (c.data as any) || [],
    thankYou: (t.data as any) || null,
  };
}

export function useProgramme() {
  return useQuery({
    queryKey: ["programme"],
    queryFn: fetchProgramme,
    staleTime: 5 * 60 * 1000,
  });
}
