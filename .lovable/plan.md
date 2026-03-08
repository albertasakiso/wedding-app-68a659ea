

## Phase 3: Brevo Email Notifications

### Overview
Create an edge function that sends transactional emails via Brevo's API for four triggers: RSVP confirmation to guest, RSVP alert to admin, gift thank-you to donor, gift alert to admin. Add an admin Email Settings tab to configure sender/admin email and toggle notifications.

### Secret Required
- **BREVO_API_KEY** — needed before implementation. User must obtain from Brevo dashboard (https://app.brevo.com) under SMTP & API > API Keys.

### Database Migration
Create `email_settings` table:
- `id` uuid PK, `admin_email` text, `sender_name` text default 'Albert & Ruby Wedding', `sender_email` text, `rsvp_notification_enabled` boolean default true, `gift_notification_enabled` boolean default true, `created_at` timestamptz

RLS: SELECT for anyone (read via edge function with service role anyway).

### New Edge Function: `email-notifications`
- Action-based: `send-rsvp-confirmation`, `send-rsvp-admin-alert`, `send-gift-thankyou`, `send-gift-admin-alert`
- Reads `email_settings` from DB to get admin email, sender info, and toggle checks
- Calls Brevo API `https://api.brevo.com/v3/smtp/email` with HTML templates
- Uses `BREVO_API_KEY` secret
- No auth required (called server-side from other functions or client after successful actions)

### Email Templates (inline HTML in edge function)
1. **RSVP Confirmation** — "Thank you for your RSVP, [name]! We look forward to celebrating with you."
2. **RSVP Admin Alert** — "[name] has RSVPed (attending: yes/no). Total RSVPs: X"
3. **Gift Thank You** — "Thank you [donor] for your generous gift of [currency][amount] towards [gift title]!"
4. **Gift Admin Alert** — "[donor] contributed [currency][amount] to [gift title]. Payment via [provider]."

### Integration Points
- **RSVP form** (`src/pages/RSVP.tsx`): After successful insert, call `email-notifications` with `send-rsvp-confirmation` + `send-rsvp-admin-alert`
- **Payment verification** (`supabase/functions/payment-api/index.ts`): After successful verification (both Paystack and Stripe), call `email-notifications` with `send-gift-thankyou` + `send-gift-admin-alert`

### Admin Dashboard: Email Settings Tab
- New `src/components/admin/EmailSettingsTab.tsx`
- Fields: admin email, sender name, sender email
- Toggles: RSVP notifications, gift notifications
- Add to `AdminDashboard.tsx` as new tab
- Add `get-email-settings` / `update-email-settings` to admin-api edge function
- Include `email_settings` in `get-dashboard` response

### Files to Create/Modify
| File | Action |
|------|--------|
| `supabase/migrations/...` | New: `email_settings` table |
| `supabase/functions/email-notifications/index.ts` | New edge function |
| `supabase/config.toml` | Add `[functions.email-notifications]` |
| `supabase/functions/admin-api/index.ts` | Add email settings CRUD + include in dashboard |
| `supabase/functions/payment-api/index.ts` | Trigger emails after successful verification |
| `src/pages/RSVP.tsx` | Trigger emails after successful RSVP |
| `src/components/admin/EmailSettingsTab.tsx` | New admin tab |
| `src/components/admin/AdminDashboard.tsx` | Add Email Settings tab |
| `src/integrations/supabase/types.ts` | Auto-updated |

### First Step
I need to add the **BREVO_API_KEY** secret before writing any code. Once you confirm you want to proceed, I'll request the secret.

