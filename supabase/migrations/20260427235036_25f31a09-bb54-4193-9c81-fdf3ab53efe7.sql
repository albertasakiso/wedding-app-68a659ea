-- Cleanup unused columns
ALTER TABLE public.payment_settings
  DROP COLUMN IF EXISTS paystack_public_key,
  DROP COLUMN IF EXISTS paystack_secret_key,
  DROP COLUMN IF EXISTS stripe_public_key,
  DROP COLUMN IF EXISTS stripe_secret_key;

ALTER TABLE public.rsvps
  DROP COLUMN IF EXISTS meal_preference,
  DROP COLUMN IF EXISTS dietary_restrictions;

-- New: dress code on site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS dress_code text,
  ADD COLUMN IF NOT EXISTS dress_code_colors text[] DEFAULT '{}'::text[];

-- New: optional email on gift_wall (for thank-you emails)
ALTER TABLE public.gift_wall
  ADD COLUMN IF NOT EXISTS email text;