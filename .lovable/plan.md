

## Comprehensive Wedding App Upgrade Plan

This is a large feature set. I recommend implementing it in **3 phases** across multiple messages to keep things stable.

---

### Phase 1: Dynamic Content from DB + Maps + Admin Content Management

**Make public pages read from database instead of hardcoded content:**

1. **EventTimeline.tsx** — Fetch events from Supabase `events` table instead of hardcoded array
2. **VenueSection.tsx** — Fetch from `venue_info` table; render dynamic venue name, address, parking, hotels
3. **GalleryPreview.tsx** — Fetch latest 4 photos from `gallery_photos` table
4. **Hero.tsx** — Add a `site_settings` table for wedding date, couple names, tagline (editable from admin)
5. **Navigation.tsx** — Fix "S & J" logo to "A & R", add Gifts nav link

**OpenStreetMap embed on Venue section:**
- Use the `map_url` field from `venue_info` or parse the address to generate an OpenStreetMap embed iframe
- Add a geocoding approach: store lat/lng in venue_info, or use address-based Nominatim URL
- Fallback: iframe embed with `https://www.openstreetmap.org/export/embed.html?bbox=...`

**Database migration:**
- Add `site_settings` table: `id`, `couple_names`, `wedding_date`, `tagline`, `hero_image_url`
- Add `latitude`, `longitude` columns to `venue_info` for map rendering

**Admin Dashboard — new Settings Tab:**
- Edit couple names, wedding date, tagline
- This drives the Hero section dynamically

---

### Phase 2: Gifts & Payments (Paystack + Stripe)

**Database:**
- Create `gift_options` table: `id`, `title`, `description`, `target_amount`, `image_url`, `is_active`, `created_at`
- Create `gift_payments` table: `id`, `gift_option_id`, `donor_name`, `donor_email`, `amount`, `currency`, `payment_method` (momo/card/bank), `payment_provider` (paystack/stripe), `payment_reference`, `status` (pending/completed/failed), `created_at`
- Create `payment_settings` table: `id`, `paystack_public_key`, `paystack_secret_key`, `stripe_public_key`, `stripe_secret_key`, `momo_enabled`, `card_enabled`, `bank_enabled`, `currency`

**Edge Functions:**
- `payment-api` — handles: initialize Paystack payment, verify Paystack payment, create Stripe checkout session, verify Stripe webhook, get gift options
- Uses secrets: `PAYSTACK_SECRET_KEY`, `STRIPE_SECRET_KEY`

**Frontend:**
- New `/gifts` page with gift registry cards showing progress bars
- Payment modal: choose payment method (MoMo, Card, Bank Transfer)
- Paystack inline popup for MoMo/Card/Bank
- Stripe redirect for international cards
- Thank you confirmation after payment

**Admin Dashboard — Gifts Tab:**
- CRUD for gift options (title, description, target amount, image)
- View all gift payments with totals
- Payment settings: enter Paystack/Stripe keys, toggle payment methods

---

### Phase 3: Brevo Email Notifications

**Secrets needed:** `BREVO_API_KEY`

**Edge Function:** `email-notifications`
- Send via Brevo transactional API (`https://api.brevo.com/v3/smtp/email`)
- Templates for: RSVP confirmation to guest, RSVP alert to admin, Gift received thank-you to donor, Gift alert to admin

**Admin Dashboard — Email Tab:**
- Configure admin notification email address
- Toggle which notifications are active
- Store in `email_settings` table: `admin_email`, `rsvp_notification_enabled`, `gift_notification_enabled`, `sender_name`, `sender_email`

**Integration points:**
- RSVP form `onSubmit` → call `email-notifications` edge function after successful insert
- Payment verification → trigger email on successful payment

---

### Implementation Order

Due to the scope, I will implement **Phase 1 first** (dynamic content, maps, admin content management). Then Phase 2 (gifts/payments) and Phase 3 (emails) in subsequent messages.

**Phase 1 will include:**
- Database migration: `site_settings` table + `latitude`/`longitude` on `venue_info`
- Make EventTimeline, VenueSection, GalleryPreview, Hero fetch from DB
- OpenStreetMap embed in VenueSection
- Admin Settings tab for site-wide config
- Fix Navigation logo text
- Add "Gifts" link to nav (page comes in Phase 2)

Shall I proceed with Phase 1?

