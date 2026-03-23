

## Multi-Feature: Messages Wall, Brevo Config, RSVP Reminders, Add to Calendar

### 1. Public Messages Wall (Scrolling Testimonials)

Create a new component `MessagesWall.tsx` using framer-motion's infinite scroll animation (from the design provided). Display real RSVP messages from Supabase with anonymized signatures (first 4 chars of name + last 4 of phone). Place it on the homepage between GalleryPreview and Footer, and also as a section on the Gifts page.

- Fetch from `rsvps` table where `message IS NOT NULL`
- Realtime subscription for live updates
- Two or three columns with different scroll speeds for visual depth
- Each card shows the message text + anonymized signature (e.g., "ASAK....4618")
- No mock data — empty state if no messages exist yet

**Files**: `src/components/MessagesWall.tsx` (new), `src/pages/Index.tsx` (add section)

### 2. Brevo Email Configuration in Admin Settings

The provided Brevo API key (`xkeysib-399fbd74...`) is a secret — store it via the secrets tool (it's already stored as `BREVO_API_KEY`; will verify). The EmailSettingsTab already exists and manages Brevo sender settings. Add custom message templates for:
- RSVP confirmation message (customizable subject + body)
- RSVP admin alert message
- Gift thank-you message (already exists)

**Files**: `src/components/admin/EmailSettingsTab.tsx` (add RSVP template customization fields), `supabase/functions/email-notifications/index.ts` (read custom templates from `email_settings`), database migration to add new columns to `email_settings`

### 3. RSVP Reminder Notifications

Add a "Send Reminder" button in the admin RSVPs tab that sends a Brevo email to all RSVP'd guests who provided an email, reminding them of the wedding date/venue.

- New action `send-rsvp-reminder` in `email-notifications` edge function
- Admin UI button in RSVPsTab with confirmation dialog
- Custom reminder email template (reads wedding date + venue from DB)
- Track which guests received reminders to avoid duplicates

**Files**: `src/components/admin/RSVPsTab.tsx` (add reminder button), `supabase/functions/email-notifications/index.ts` (add `send-rsvp-reminder` action)

### 4. Add to Calendar Feature

After successful RSVP submission, show an "Add to Calendar" button that generates calendar links/files:
- Google Calendar link (opens in browser)
- Apple/Outlook (.ics file download)
- Calendar event includes: wedding date/time, venue name, address, and a deep link to Google Maps using venue coordinates

Fetch venue info from Supabase to populate location fields.

**Files**: `src/pages/RSVP.tsx` (add calendar buttons to success state), `src/lib/calendar-utils.ts` (new — generate Google Calendar URL and .ics file)

---

### Database Migration

Add columns to `email_settings`:
```sql
ALTER TABLE public.email_settings 
  ADD COLUMN IF NOT EXISTS rsvp_confirmation_subject text DEFAULT 'RSVP Confirmation — Albert & Ruby Wedding',
  ADD COLUMN IF NOT EXISTS rsvp_confirmation_message text DEFAULT 'Thank you for your RSVP! We can''t wait to celebrate with you.',
  ADD COLUMN IF NOT EXISTS rsvp_reminder_subject text DEFAULT 'Reminder: Albert & Ruby Wedding is Coming!',
  ADD COLUMN IF NOT EXISTS rsvp_reminder_message text DEFAULT 'Just a friendly reminder that our wedding is coming up soon. We can''t wait to see you there!';
```

### Files Summary

| File | Action |
|------|--------|
| `supabase/migrations/...` | Add RSVP email template columns to `email_settings` |
| `src/components/MessagesWall.tsx` | New: scrolling messages wall with framer-motion |
| `src/pages/Index.tsx` | Add MessagesWall section |
| `src/lib/calendar-utils.ts` | New: Google Calendar URL + .ics file generator |
| `src/pages/RSVP.tsx` | Add calendar buttons + venue fetch on success |
| `src/components/admin/EmailSettingsTab.tsx` | Add RSVP email template customization |
| `src/components/admin/RSVPsTab.tsx` | Add "Send Reminder" button |
| `supabase/functions/email-notifications/index.ts` | Add `send-rsvp-reminder` action, use custom RSVP templates |

