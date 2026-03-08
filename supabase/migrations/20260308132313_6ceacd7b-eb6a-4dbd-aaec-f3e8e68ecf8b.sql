
CREATE TABLE public.email_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text,
  sender_name text NOT NULL DEFAULT 'Albert & Ruby Wedding',
  sender_email text,
  rsvp_notification_enabled boolean NOT NULL DEFAULT true,
  gift_notification_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Anyone can read email settings" ON public.email_settings FOR SELECT USING (true);
