

## Premium Upgrade: Gifts, RSVP, Gallery, and Public Wall

This is a large multi-feature request. I'll break it into clear implementation steps.

---

### 1. Gifts Page — Bold, Clear Payment Details

**`src/pages/Gifts.tsx`**:
- Increase MoMo/Telecel phone numbers to `text-2xl font-bold font-sans tracking-wider` (using system sans-serif for maximum number clarity)
- Bank account number and all bank details: same bold, enlarged, clear sans-serif treatment
- Labels like "Account Name", "Bank" stay as muted descriptors but details are bold and large
- Remove any decorative border lines on the sides of the payment cards (set `border-none` or remove `border` class, use only `shadow-soft`)
- Make the gift confirmation form ask for phone number (required) and gift type (MoMo / Bank / Physical Gift) so the wall can display it

### 2. RSVP Form — Email Optional, Phone Required

**`src/pages/RSVP.tsx`**:
- Make email **optional** — only prompt for email when "I'd like to receive photos" is checked
- Make phone number **required** (used for public wall display)
- Update zod schema accordingly
- On successful RSVP submission, fetch and display a public count: "🎉 You are guest #68!" by querying `rsvps` count where `attending = true`
- Show gift wall count too: "💛 X gifts received so far"

### 3. Gallery Page — Carousel with Modal Lightbox

**`src/pages/Gallery.tsx`**:
- Replace the masonry grid with a responsive carousel (using Embla via shadcn Carousel component already in project)
- Click on any photo opens the existing lightbox modal with prev/next navigation
- Realtime Supabase subscription so new photos appear live

### 4. Admin Gift Registry — Image Upload with WebP Conversion

**`src/components/admin/GiftsTab.tsx`**:
- Replace the "Image URL" text input with a proper file upload input
- Accept images up to 15MB, client-side convert to WebP using Canvas API before upload
- Show upload progress, conversion status (original size → WebP size)
- Store in Supabase `gallery` storage bucket (or create a `gifts` bucket)
- On edit, pre-populate all fields including showing the current image preview
- Gift type options expanded: Cash, MoMo, Bank, Physical Gift

### 5. Admin Gallery — Image Upload with WebP Conversion

**`src/components/admin/GalleryTab.tsx`**:
- Same WebP conversion treatment: accept up to 15MB, convert client-side, show conversion stats
- On upload success show size reduction info

### 6. Public Wall — Two-Column RSVP | Gifts

**`src/pages/Gifts.tsx`** (bottom section, replaces current Gift Wall):
- Two-column layout: **RSVP** column | **Gifts** column
- **RSVP column**: Show entries as "ASAK....4618 — RSVP'd" (first 4 chars of first name + last 4 digits of phone)
- **Gifts column**: Show entries as "ASAK....4618 — MoMo" (first 4 of name + last 4 of phone + gift type badge)
- No full names, no amounts displayed
- Fetch RSVP data from `rsvps` table (attending = true) and gift_wall data

### 7. Database Changes

**Migration**: Add `phone` column to `gift_wall` table:
```sql
ALTER TABLE public.gift_wall ADD COLUMN IF NOT EXISTS phone text;
```

Update `gift_wall` RLS to allow public INSERT (for the self-report form):
```sql
CREATE POLICY "Anyone can insert gift wall"
ON public.gift_wall FOR INSERT TO public
WITH CHECK (true);
```

### 8. Edge Function Updates

**`supabase/functions/payment-api/index.ts`**: Update `record-manual-gift` to accept `phone` and `gift_type` params.

### 9. Realtime Subscriptions

**`src/pages/Gifts.tsx`** and **`src/pages/Gallery.tsx`**: Add Supabase realtime subscriptions on `gift_wall`, `rsvps`, and `gallery_photos` tables so content updates live without refresh.

### 10. Shared WebP Conversion Utility

**`src/lib/image-utils.ts`** (new): Create a reusable `convertToWebP(file, maxSizeMB)` function that:
- Uses Canvas API to convert any image to WebP
- Returns the WebP blob + metadata (original size, converted size)
- Used by both GalleryTab and GiftsTab

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/...` | Add `phone` to `gift_wall`, add INSERT RLS policy |
| `src/lib/image-utils.ts` | New: WebP conversion utility |
| `src/pages/Gifts.tsx` | Bold payment numbers, phone+type in confirm form, two-column public wall with RSVP+Gifts, realtime |
| `src/pages/RSVP.tsx` | Email optional (prompted by photo checkbox), phone required, show count on success |
| `src/pages/Gallery.tsx` | Carousel layout, lightbox with nav, realtime subscription |
| `src/components/admin/GiftsTab.tsx` | Image upload with WebP conversion, edit pre-population, expanded gift types |
| `src/components/admin/GalleryTab.tsx` | WebP conversion on upload, size stats |
| `supabase/functions/payment-api/index.ts` | Accept phone + gift_type in `record-manual-gift` |

