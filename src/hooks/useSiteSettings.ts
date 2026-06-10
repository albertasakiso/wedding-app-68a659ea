import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id?: string;
  couple_names: string;
  wedding_date: string;
  tagline: string | null;
  hero_image_url: string | null;
}

const DEFAULTS: SiteSettings = {
  couple_names: "Albert & Ruby",
  wedding_date: "2026-06-13T11:00:00Z",
  tagline: "Together with their families",
  hero_image_url: null,
};

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("id, couple_names, wedding_date, tagline, hero_image_url")
        .limit(1)
        .single();
      return data ? { ...DEFAULTS, ...data } : DEFAULTS;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: DEFAULTS,
  });
}

/**
 * Returns true once we're on/past the wedding day (local time).
 * Used to auto-close RSVPs on the day of the wedding.
 */
export function isWeddingDayOrPast(weddingIso?: string | null): boolean {
  if (!weddingIso) return false;
  const wedding = new Date(weddingIso);
  if (isNaN(wedding.getTime())) return false;
  const now = new Date();
  // Compare at calendar-day granularity (local time)
  const wDay = new Date(wedding.getFullYear(), wedding.getMonth(), wedding.getDate()).getTime();
  const nDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return nDay >= wDay;
}

export function useIsWeddingDayOrPast(): boolean {
  const { data } = useSiteSettings();
  return isWeddingDayOrPast(data?.wedding_date);
}
