# Round 10 — 4 small UX fixes

## 1. Well Wishes hidden on mobile
`MessagesWall.tsx` splits messages into 3 columns by index `% 3`. Column 2 (the only one visible on mobile) gets every 3rd message starting at index 1 — when there are 1–2 total messages, the mobile column is empty so the whole section vanishes.

**Fix:** on mobile, feed the middle column the **full list** of messages (no slicing), and keep the 2/3-column split only at `md`/`lg`. Render two `<MessagesColumn>` instances — one mobile-only with all messages, one desktop-only with the existing 3-column layout — so the section always shows on phones.

## 2. "Support the Couple" on the QR landing
`src/pages/QrLanding.tsx` currently shows three choices: RSVP, Programme, Check In. Add a fourth card:
- **Title:** "Support the Couple"
- **Subtitle:** "Send a gift or blessing"
- **Icon:** `Gift` from lucide-react
- **Link:** `/gifts`
Place it after RSVP so guests see it early.

## 3. Gift CTA inside the RSVP confirmation email
In `supabase/functions/email-notifications/index.ts`, the **attending** branch of `send-rsvp-confirmation` currently only links to the homepage. Add a soft "If you'd like to bless us with a gift" block (same warm tone as the not-attending variant) with a button linking to `${siteUrl}/gifts`. Keep the existing "Visit Our Wedding Site" CTA below it. Mention MTN MoMo / Telecel Cash / GCB so guests know payment options exist.

The not-attending branch already has this — no change there.

## 4. Old date flash on first load
DB already holds `2026-06-13 11:00:00+00`, but three files hardcode `2026-05-02T15:00:00Z` as the default that renders before the fetch resolves:
- `src/components/Hero.tsx` (line 29) — Hero shows `dateStr` from this default until settings load.
- `src/hooks/useSiteSettings.ts` (line 15) — `DEFAULTS.wedding_date`.
- `src/lib/date-utils.ts` (line 6) — `DEFAULT_WEDDING_ISO`.

**Fix:**
- Update all three constants to `2026-06-13T11:00:00Z` so any pre-fetch render matches reality.
- In `Hero.tsx`, also gate the `dateStr` line behind `settingsLoaded` (render a thin shimmer placeholder instead) so a stale cached value can never flash either.

## Files touched
- `src/components/MessagesWall.tsx`
- `src/pages/QrLanding.tsx`
- `supabase/functions/email-notifications/index.ts`
- `src/components/Hero.tsx`
- `src/hooks/useSiteSettings.ts`
- `src/lib/date-utils.ts`

## Out of scope
No DB migrations, no new tables, no schema changes, no admin-side changes.
