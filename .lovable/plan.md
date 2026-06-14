## Post-Wedding Simplification

The wedding is over. Strip the entire site down to a single page: a heartfelt **Thank You** message with the **Support the Couple** details. Remove every other route, page, and navigation element from both the main site and the QR landing.

### What the new site contains (one page only, at `/`)

1. **Hero / Thank You block**
   - Monogram logo
   - "Albert & Ruby" couple names
   - Large "Thank You" headline
   - Short message: gratitude to guests for celebrating with them, mention of the wedding date in past tense
   - Subtle decorative ornament (matching existing gold/ivory theme)

2. **Support the Couple block** (pulled live from existing `payment_settings` table — MTN MoMo, Telecel, GCB, etc.)
   - Same payment cards already used on `/gifts`
   - Copy-to-clipboard buttons preserved
   - Optional short note: "If you'd still like to bless us, here's how"
   - The existing manual gift self-reporting form is **removed** (keep it simple — display details only)

3. **Footer** — minimal, just couple names + year

### What gets removed

**Routes / pages deleted from `src/App.tsx` and `src/pages/`:**
- `/rsvp` (RSVP.tsx)
- `/gallery` (Gallery.tsx)
- `/gifts` (Gifts.tsx) — replaced by inline block on landing
- `/my-day` (MyDay.tsx)
- `/qr` (QrLanding.tsx) — QR now points straight to `/`
- `/check-in` (CheckIn.tsx)
- `/programme` (Programme.tsx)
- All section anchors (`#schedule`, `#venue`, etc.)

**Components no longer used (deleted):**
- `Navigation.tsx`, `Hero.tsx` (replaced), `EventTimeline.tsx`, `ProgrammePreview.tsx`, `VenueSection.tsx`, `StorySection.tsx`, `DressCode.tsx`, `GalleryPreview.tsx`, `MessagesWall.tsx`, `ShareInvite.tsx`, `ProgrammeSkeleton.tsx`

**Kept (still useful):**
- `/admin` — admin dashboard stays untouched so you can still view RSVPs, gifts, messages, gallery archives
- All Supabase tables and edge functions — data is preserved, just not displayed publicly
- Payment settings hook + display logic (extracted from current Gifts page)
- Logo, design tokens, Footer (simplified)

### Files touched

- **Rewrite**: `src/pages/Index.tsx` (becomes the thank-you + support page)
- **Edit**: `src/App.tsx` (remove all routes except `/` and `/admin`, drop lazy imports, drop RSVP gate)
- **Edit**: `index.html` (update `<title>` and meta description to thank-you wording; update OG image text if regenerated)
- **Edit**: `src/components/Footer.tsx` (minimal version)
- **Delete**: all the page + component files listed above
- **QR code**: no code change needed — existing printed QRs that point to `/qr` will redirect; we'll make `/qr` and any other old path redirect to `/` via a catch-all route so old QR scans still land on the thank-you page

### Open question

The current `/gifts` page also has a **"Record a gift you sent"** self-reporting form. Confirm you want this **removed** (display payment details only) — that's what I've planned. If you want guests to still be able to log a gift, say so and I'll keep the form.
