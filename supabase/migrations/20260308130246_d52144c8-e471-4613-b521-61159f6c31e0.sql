
-- Gift registry items
CREATE TABLE public.gift_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  target_amount numeric NOT NULL DEFAULT 0,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payment records
CREATE TABLE public.gift_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_option_id uuid REFERENCES public.gift_options(id) ON DELETE CASCADE NOT NULL,
  donor_name text NOT NULL,
  donor_email text,
  donor_phone text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'GHS',
  payment_method text,
  payment_provider text,
  payment_reference text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Admin-configurable payment keys & toggles
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paystack_public_key text,
  paystack_secret_key text,
  stripe_public_key text,
  stripe_secret_key text,
  momo_enabled boolean NOT NULL DEFAULT true,
  card_enabled boolean NOT NULL DEFAULT true,
  bank_enabled boolean NOT NULL DEFAULT true,
  currency text NOT NULL DEFAULT 'GHS',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
-- gift_options: public read
CREATE POLICY "Anyone can read gift options" ON public.gift_options FOR SELECT USING (true);

-- gift_payments: public insert + read
CREATE POLICY "Anyone can make gift payments" ON public.gift_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read gift payments" ON public.gift_payments FOR SELECT USING (true);

-- payment_settings: public read (keys shown partially on frontend, full keys only used in edge fn)
CREATE POLICY "Anyone can read payment settings" ON public.payment_settings FOR SELECT USING (true);
