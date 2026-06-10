## Round 13 — Programme CMS, wedding-day auto-hide, share thumbnail, QR additions

### 1. Share link thumbnail (og:image)
- The site currently has no `og:image`, so WhatsApp/iMessage/Slack render a blank thumbnail.
- Generate a 1200×630 share card (monogram + "Albert & Ruby — 13 June 2026 · Church of Pentecost, Mpoasei Central, Dansoman") and save as `public/og-image.jpg`.
- Add to `index.html`: `og:image`, `og:image:width/height`, `twitter:card=summary_large_image`, `twitter:image`. Keep paths absolute-relative (`/og-image.jpg`).

### 2. Programme CMS (full CRUD in Admin)
New Supabase tables (all with `order_index`, `section`-scoped where useful, RLS = public SELECT, admin via edge function):

| Table | Purpose | Key fields |
|---|---|---|
| `programme_sections` | Top-level toggle + ordering per section | `key` (order_of_service / functionaries / hymns / photography / exclusives / thank_you / cover), `title`, `enabled`, `order_index` |
| `programme_functionaries` | Officiating Ministers, Counsellors, Protocol | `group` (ministers/counsellors/protocol), `name`, `affiliation`, `order_index` |
| `programme_order_of_service` | Order of Service items | `item`, `led_by`, `order_index` |
| `programme_hymns` | Hymns | `title`, `reference` (e.g. PSB-T 133), `author`, `lyrics` (markdown), `order_index` |
| `programme_photography` | Order of Photography + Exclusives | `category` (order/exclusives), `label`, `order_index` |
| `programme_credits` | Photography/Make-up/Decor/Gift Table contacts | `role`, `name`, `phone`, `order_index` |
| `programme_thank_you` | Thank-you note (single row, rich text) | `body` |

Seed all rows from the uploaded trifold images (front + back).

Admin: new **Programme** tab in `AdminDashboard` with sub-tabs per table (reuse existing `EventsTab` pattern + `adminApi` actions: `list/insert/update/delete-programme-*`). New edge-function actions added to `supabase/functions/admin-api/index.ts`.

### 3. Programme display
- **New `/programme` page** — full trifold-style layout (3 column on desktop, stacked on mobile), gold/ivory theme, sections in this order: Cover (monogram + date + venue + verse), Order of Service, Functionaries, Hymns, Photography, Exclusives, Credits, Thank You.
- **Home page** — under `EventTimeline`, add a `ProgrammePreview` section: shows the next 4 Order-of-Service items + a "View Full Programme" CTA → `/programme`, and a "Download PDF" button.
- Add Nav link "Programme".

### 4. Download as PDF
- Client-side generation using `jspdf` + `html2canvas` (already in stack-compatible deps; add via `bun add`).
- "Download PDF" button on `/programme` and home preview renders the live `/programme` DOM → multi-page A4 PDF, gold theme preserved.
- Filename: `Albert-and-Ruby-Wedding-Programme.pdf`.

### 5. Auto-hide RSVP on wedding day
Centralize in `useSiteSettings` → derive `isWeddingDayOrPast` from `wedding_date` (compare to `now()` at day granularity, Africa/Accra).
Hide when true:
- Nav "RSVP" link
- Hero CTA "RSVP" button
- QR landing "RSVP" entry
- `/rsvp` route → redirect to `/` with a toast "RSVPs are closed — see you at the celebration!"
Admin-only `/admin` access to RSVPs stays unchanged.

### 6. QR landing additions (`src/pages/QrLanding.tsx`)
Reorder + add entries:
1. Programme (NEW) → `/programme`, icon `BookOpen`
2. Venue Location (existing)
3. Check In
4. Gifts
5. RSVP (auto-hidden on/after wedding day)
Keep the existing external-link pattern for Venue Location.

### 7. Files touched
- New: `supabase/migrations/<ts>_programme_cms.sql`, `src/pages/Programme.tsx`, `src/components/ProgrammePreview.tsx`, `src/components/admin/ProgrammeTab.tsx` (+ sub-tab components), `src/lib/programme-pdf.ts`, `src/hooks/useProgramme.ts`, `public/og-image.jpg`.
- Edited: `index.html`, `src/App.tsx` (route + RSVP redirect), `src/components/Navigation.tsx`, `src/components/Hero.tsx` (hide RSVP CTA), `src/pages/QrLanding.tsx`, `src/pages/Index.tsx` (mount ProgrammePreview), `src/hooks/useSiteSettings.ts` (expose `isWeddingDayOrPast`), `supabase/functions/admin-api/index.ts`, `src/components/admin/AdminDashboard.tsx`.
- Dep adds: `jspdf`, `html2canvas`.

### Notes / open choices that I'll default unless you say otherwise
- Cutoff time for "wedding day" hide: **start of the wedding date in Africa/Accra timezone** (so RSVP stays available until 00:00 on 13 June 2026).
- PDF layout: **single-page A4 portrait** if it fits, otherwise multi-page; gold accents preserved via `html2canvas` rasterization (so it looks identical to the on-screen programme).
- og:image: I'll generate a fresh elegant card matching the site theme — not the trifold scan (too dense for a 1200×630 preview).
