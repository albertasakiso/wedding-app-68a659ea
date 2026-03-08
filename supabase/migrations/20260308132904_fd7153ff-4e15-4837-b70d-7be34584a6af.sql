ALTER TABLE public.email_settings
  ADD COLUMN gift_thankyou_subject text NOT NULL DEFAULT 'Thank You for Your Gift! — Albert & Ruby',
  ADD COLUMN gift_thankyou_message text NOT NULL DEFAULT 'Your generous contribution means the world to us. We truly appreciate your love and support as we begin this new chapter together.';