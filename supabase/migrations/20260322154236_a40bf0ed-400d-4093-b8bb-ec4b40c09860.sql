ALTER TABLE public.gift_wall ADD COLUMN IF NOT EXISTS phone text;

CREATE POLICY "Anyone can insert gift wall"
ON public.gift_wall FOR INSERT TO anon, authenticated
WITH CHECK (true);