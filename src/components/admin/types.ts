import type { Database } from "@/integrations/supabase/types";

export type RSVPRow = Database["public"]["Tables"]["rsvps"]["Row"];
export type GiftPaymentRow = Database["public"]["Tables"]["gift_payments"]["Row"];
export type GiftWallRow = Database["public"]["Tables"]["gift_wall"]["Row"];
export type GalleryPhotoRow = Database["public"]["Tables"]["gallery_photos"]["Row"];
export type GiftOptionRow = Database["public"]["Tables"]["gift_options"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
export type VenueInfoRow = Database["public"]["Tables"]["venue_info"]["Row"];
export type EmailListRow = Database["public"]["Tables"]["email_list"]["Row"];
export type EmailSettingsRow = Database["public"]["Tables"]["email_settings"]["Row"];
export type PaymentSettingsRow = Database["public"]["Tables"]["payment_settings"]["Row"];

export interface DashboardData {
  rsvps: RSVPRow[];
  events: EventRow[];
  venue: VenueInfoRow | null;
  photos: GalleryPhotoRow[];
  settings: SiteSettingsRow | null;
  email_list: EmailListRow[];
  gift_options: GiftOptionRow[];
  gift_payments: GiftPaymentRow[];
  payment_settings: PaymentSettingsRow | null;
  email_settings: EmailSettingsRow | null;
  gift_wall: GiftWallRow[];
}

export interface StoryMilestone {
  year: string;
  title: string;
  description: string;
  image_url?: string;
}
