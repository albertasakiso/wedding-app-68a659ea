
-- Site settings table for dynamic hero content
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_names text NOT NULL DEFAULT 'Albert & Ruby',
  wedding_date timestamp with time zone NOT NULL DEFAULT '2026-05-02T15:00:00Z',
  tagline text DEFAULT 'Together with their families',
  hero_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS: anyone can read
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);

-- Add lat/lng to venue_info for OpenStreetMap
ALTER TABLE public.venue_info ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.venue_info ADD COLUMN IF NOT EXISTS longitude double precision;

-- Insert default settings row
INSERT INTO public.site_settings (couple_names, wedding_date, tagline) VALUES ('Albert & Ruby', '2026-05-02T15:00:00Z', 'Together with their families');
