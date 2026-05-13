## 1. New logo: interlocking gold rings with A & R

Generate a premium-quality logo image with `imagegen` (transparent PNG):
- Two overlapping/interlocking gold rings (warm champagne gold gradient, subtle metallic shading).
- Inside the left ring: elegant serif **A**. Inside the right ring: elegant serif **R**.
- Centered, balanced, no extra text, transparent background.
- 1024×1024 source for crispness on favicon, OG share, and hero.

Save to:
- `src/assets/wedding-logo.png` (replace existing — used by `<Logo />` component)
- `public/wedding-logo.png` (replace existing — used by favicon, OG, Apple touch)

Because `Logo.tsx` imports `@/assets/wedding-logo.png` and `index.html` references `/wedding-logo.png`, **simply replacing both files propagates the new logo everywhere**:
- Favicon + Apple touch icon + OG/Twitter share image (`index.html` already wired)
- Navigation bar (`Navigation.tsx` uses `<Logo />`)
- Mobile sheet header (already uses `<Logo />`)
- Footer (`Footer.tsx` uses `<Logo />`)
- Hero section (`Hero.tsx` uses `<Logo />`)
- Admin login (`AdminLogin.tsx` uses `<Logo />`)

QA: visually inspect the generated PNG at multiple sizes before delivery; regenerate if rings/letters are unbalanced.

## 2. Customized RSVP auto-reply email

Update `supabase/functions/email-notifications/index.ts` so the **guest confirmation email** branches on `attending`:

**Attending** — current warm confirmation, refined:
- Subject: existing `rsvp_confirmation_subject`
- Body: "We can't wait to celebrate with you on {wedding_date} at {venue_name}." + venue address + dress code reminder + link back to site.

**Not attending** — new compassionate variant:
- Subject: "We'll miss you — Albert & Ruby"
- Body: warmly acknowledge they can't make it, say they'll be missed, gently mention the Gifts page as a way to still be part of the celebration with a clear CTA button to `/gifts`.
- Include a brief line: "If you'd like to send a blessing instead, our gift page lists MoMo, Telecel and GCB options."

Both variants:
- Use the existing Brevo sender (`sender_name`, `sender_email`, `sender_reply_to`) — no new config.
- Use the same gold/ivory HTML email shell already in the function for visual consistency with the new logo (embed `<img src="https://<site>/wedding-logo.png">` at the top).
- Continue to honor `rsvp_notification_enabled` toggle.
- Pull `wedding_date`, `venue_name`, `venue_address` dynamically (already available in the function via `site_settings` / `venues`).

Admin notification email to the couple is unchanged.

## 3. Memory update

Update `mem://design/branding-logo` to note the new "interlocking gold rings A & R" design and that swapping the two PNG files is the canonical update path.

## Technical notes

- Files touched: `src/assets/wedding-logo.png` (replace), `public/wedding-logo.png` (replace), `supabase/functions/email-notifications/index.ts` (branching + not-attending template), `mem://design/branding-logo` (note).
- No DB migration. No new secrets. No new edge functions.
- No frontend component edits needed — `<Logo />` consumers automatically get the new asset.
- Edge function auto-deploys on save.
