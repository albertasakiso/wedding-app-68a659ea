
-- Add phone column to rsvps
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS phone text;

-- Create email_list table for post-event photo sharing
CREATE TABLE public.email_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subscribed boolean NOT NULL DEFAULT true,
  source text DEFAULT 'rsvp',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.email_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.email_list FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read email list" ON public.email_list FOR SELECT USING (true);
