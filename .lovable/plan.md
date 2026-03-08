

## Add Custom Gift Thank-You Email Message

### What
Allow the admin to configure a custom greeting and thank-you message that gets sent to donors after a successful gift payment. Currently the thank-you email text is hardcoded in the edge function.

### Database Change
Add two columns to `email_settings`:
- `gift_thankyou_subject` text (default: `'Thank You for Your Gift! — Albert & Ruby'`)
- `gift_thankyou_message` text (default: `'Your generous contribution means the world to us. We truly appreciate your love and support as we begin this new chapter together.'`)

### Edge Function Update (`email-notifications`)
In the `send-gift-thankyou` case, use the custom subject and message from `email_settings` instead of hardcoded text. Template variables like `{donor_name}`, `{amount}`, `{currency}`, `{gift_title}` will be replaced dynamically.

### Admin UI Update (`EmailSettingsTab.tsx`)
Add a "Gift Thank-You Email" card with:
- Subject line input
- Message textarea with placeholder variable hints (`{donor_name}`, `{amount}`, etc.)

### Admin API Update (`admin-api`)
Include the new fields in `update-email-settings` handler.

### Files Modified
- `supabase/migrations/` — add columns to `email_settings`
- `supabase/functions/email-notifications/index.ts` — use custom message
- `supabase/functions/admin-api/index.ts` — handle new fields
- `src/components/admin/EmailSettingsTab.tsx` — add subject + message inputs
- `src/integrations/supabase/types.ts` — auto-updated

