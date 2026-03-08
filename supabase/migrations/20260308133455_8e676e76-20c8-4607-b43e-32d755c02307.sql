
CREATE TABLE public.gift_wall (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  gift_type text NOT NULL DEFAULT 'cash',
  message text,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: public can only SELECT visible entries
CREATE POLICY "Anyone can read visible gift wall entries"
  ON public.gift_wall FOR SELECT
  USING (is_visible = true);
