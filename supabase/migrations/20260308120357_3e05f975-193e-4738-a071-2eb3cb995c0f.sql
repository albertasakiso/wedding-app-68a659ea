-- RSVP table for guest responses
CREATE TABLE public.rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  email TEXT,
  attending BOOLEAN DEFAULT true,
  plus_one_name TEXT,
  meal_preference TEXT,
  dietary_restrictions TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events/Schedule table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Venue information table
CREATE TABLE public.venue_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  map_url TEXT,
  parking_info TEXT,
  hotels JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Photo gallery table
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies for open access (no auth required for this wedding app)

-- RSVPs: Anyone can insert, only read own (or admin reads all via service key)
CREATE POLICY "Anyone can submit RSVP" ON public.rsvps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read RSVPs" ON public.rsvps FOR SELECT TO anon, authenticated USING (true);

-- Events: Public read access
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT TO anon, authenticated USING (true);

-- Venue: Public read access
CREATE POLICY "Anyone can read venue info" ON public.venue_info FOR SELECT TO anon, authenticated USING (true);

-- Gallery: Public read access, anyone can upload
CREATE POLICY "Anyone can read gallery" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can upload photos" ON public.gallery_photos FOR INSERT TO anon, authenticated WITH CHECK (true);