## Round 6 — Branding, Polish & Email Hardening

### 1. Wedding Logo Everywhere
- Copy uploaded logo → `src/assets/wedding-logo.png` and `public/wedding-logo.png` (favicon + OG share).
- `index.html`: replace favicon, `apple-touch-icon`, `og:image`, `twitter:image` with `/wedding-logo.png`. Update title/description to remove hardcoded "May 2, 2026" — keep evergreen ("Apiligu Albert & Ruby — Our Wedding").
- Delete old `public/favicon.ico`.
- `Hero.tsx`: render logo image above (or replacing) the typed names; keep names accessible via `alt` and visually-hidden `<h1>` for SEO.
- `Navigation.tsx`: small logo mark to the left of "A & R" text (keep text on desktop, logo-only on mobile).
- `Footer.tsx`: small centered logo above couple names.
- `AdminLogin.tsx`: logo above the login card.

### 2. Mobile Navigation Fix
- Audit current `Navigation.tsx`: mobile menu sits on `absolute top-full` inside a `fixed` nav — works, but spacing/contrast on mobile + active route highlight + tap-target sizing are off, and items overflow on small screens.
- Rebuild mobile menu using shadcn `Sheet` (slide-in from right) for reliable behavior on iOS Safari and to fit all 7 links comfortably with bigger tap targets, dividers, and clear active state.
- Ensure logo + hamburger sit on the same row at all viewports; close menu on route change automatically.

### 3. Dynamic Dates Across Site (driven by `site_settings.wedding_date`)
- New util `src/lib/date-utils.ts` exporting `formatWeddingDate(date, style)` with styles: `long` ("May 2nd, 2026"), `short` ("May 2, 2026"), `weekday` ("Saturday, May 2, 2026"), `iso`.
- New shared hook `src/hooks/useSiteSettings.ts` (cached via React Query) so every component reads the same source.
- Replace hardcoded date strings in:
  - `Footer.tsx` ("May 2nd, 2026" + © year).
  - `RSVP.tsx` ("Please respond by April 1st, 2026" → derive RSVP-by as wedding date − 30 days, configurable later).
  - `Hero.tsx` (already dynamic; just confirm and add fallback).
  - `ShareInvite.tsx` invitation text uses settings date.
  - `index.html` `<title>` & meta become evergreen (cannot read DB at build time).
  - Email templates in `email-notifications/index.ts` already pull `wedding_date` — verify and add a default fallback.

### 4. Admin → "View Public Site" Link
- Add a "View Site" button (opens `/` in a new tab) in `AdminDashboard.tsx` header, next to the user info (both full admin and gift-recorder views).

### 5. Remove Public Photo Upload
- Delete the `<PhotoUploadCard />` usage from `src/pages/Gallery.tsx`.
- Replace empty-state CTA "Be the first to share a moment — upload above" with "Photos will appear here after the wedding."
- Tighten RLS: drop the public INSERT policy on `gallery_photos` so only admin-API (service role) can insert. Migration:
  ```sql
  DROP POLICY IF EXISTS "Anyone can upload photos" ON public.gallery_photos;
  ```
- Keep `PhotoUploadCard.tsx` file in place for now (unused, no harm) or delete to keep tree clean — will delete.

### 6. Email Configuration Hardening (Brevo only, per your direction)
Stay on Brevo (no Resend / no SMTP fork — keeps things simple as you requested). Improvements:

- **Sender domain & reply-to**: add columns `sender_reply_to TEXT`, `sender_domain TEXT` to `email_settings`. Surface in `EmailSettingsTab.tsx`. Helps Brevo deliverability when sender_email matches a verified Brevo sender.
- **Connection status indicator**: small panel in `EmailSettingsTab` that hits a new admin-api action `verify-brevo-key` → calls Brevo `/v3/account` to confirm key works and shows the verified company/email.
- **Test email button**: new admin-api action `send-test-email` → uses the saved settings to send a styled test message to the admin email (or a custom address typed inline). Status + Brevo response shown inline.
- **Use settings for ALL sends**: `email-notifications` already reads `email_settings`; verify each branch (RSVP confirm, RSVP admin alert, gift thank-you, gift admin alert, RSVP reminder bulk) uses `sender_name`, `sender_email`, and (new) `reply_to`. Add `replyTo` to the Brevo payload helper.
- **Deliverability hints in UI**: copy under "Sender Email" warning that this address must be a *verified sender* in Brevo (link out to Brevo senders page); copy under "Sender Domain" recommends adding SPF + DKIM records in Brevo for higher inbox rates.

### 7. Memory Update
- Update `mem://technical/email-integration` to record: Brevo only, settings-driven sender + reply-to + test send, no SMTP/Resend split.
- Add `mem://design/branding-logo` noting logo file path + usage points.

---

## Technical Implementation Details

**Files created**
- `src/assets/wedding-logo.png` (copied from upload)
- `public/wedding-logo.png` (favicon/OG)
- `src/lib/date-utils.ts`
- `src/hooks/useSiteSettings.ts`
- `src/components/Logo.tsx` (sized variants)

**Files edited**
- `index.html` (favicon, OG, title)
- `src/components/Navigation.tsx` (Sheet-based mobile menu, logo)
- `src/components/Footer.tsx` (logo, dynamic date)
- `src/components/Hero.tsx` (logo + dynamic)
- `src/components/ShareInvite.tsx` (dynamic date in share text)
- `src/pages/RSVP.tsx` (dynamic respond-by date)
- `src/pages/Gallery.tsx` (remove upload card)
- `src/components/admin/AdminLogin.tsx` (logo)
- `src/components/admin/AdminDashboard.tsx` ("View Site" button)
- `src/components/admin/EmailSettingsTab.tsx` (reply-to + domain + verify + test)
- `supabase/functions/admin-api/index.ts` (new actions: `verify-brevo-key`, `send-test-email`, updated `update-email-settings`)
- `supabase/functions/email-notifications/index.ts` (use `reply_to`)

**Files deleted**
- `public/favicon.ico`
- `src/components/PhotoUploadCard.tsx`

**DB migration (single)**
- `ALTER TABLE email_settings ADD COLUMN sender_reply_to TEXT, ADD COLUMN sender_domain TEXT;`
- `DROP POLICY "Anyone can upload photos" ON gallery_photos;`

No new secrets needed (Brevo key already present).
