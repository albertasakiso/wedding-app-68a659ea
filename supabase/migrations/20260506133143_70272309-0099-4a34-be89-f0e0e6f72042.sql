ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS sender_reply_to TEXT,
  ADD COLUMN IF NOT EXISTS sender_domain TEXT;

DROP POLICY IF EXISTS "Anyone can upload photos" ON public.gallery_photos;