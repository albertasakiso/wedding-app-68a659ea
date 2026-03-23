ALTER TABLE public.email_settings 
  ADD COLUMN IF NOT EXISTS rsvp_confirmation_subject text DEFAULT 'RSVP Confirmation — Albert & Ruby Wedding',
  ADD COLUMN IF NOT EXISTS rsvp_confirmation_message text DEFAULT 'Thank you for your RSVP! We can''t wait to celebrate with you.',
  ADD COLUMN IF NOT EXISTS rsvp_reminder_subject text DEFAULT 'Reminder: Albert & Ruby Wedding is Coming!',
  ADD COLUMN IF NOT EXISTS rsvp_reminder_message text DEFAULT 'Just a friendly reminder that our wedding is coming up soon. We can''t wait to see you there!';