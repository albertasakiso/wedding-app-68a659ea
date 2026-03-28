

## Fix Gallery Duplicates & Review Unimplemented FRs

### 1. Gallery — Remove Duplicate Photos

The gallery currently renders photos **twice**: once in a Carousel (lines 101-129) and again in a masonry grid below (lines 131-154). Remove the Carousel section entirely and keep only a **uniform grid** with equal-size cards (`aspect-square`), which matches the placeholder layout style.

**`src/pages/Gallery.tsx`**:
- Remove the Carousel import and the entire Carousel block (lines 8-10, 101-129)
- Replace the masonry `columns-*` layout (lines 132-154) with a `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4` using `aspect-square` cards
- Keep the lightbox modal and realtime subscription as-is

### 2. Unimplemented FRs — Status Check

All major planned features appear implemented:
- Bold payment details on Gifts page
- Phone-based anonymized public wall (RSVP | Gifts columns)
- Gallery with lightbox + realtime
- Admin WebP image upload for Gallery and Gifts
- RSVP with optional email, required phone, guest count on success
- Messages Wall on homepage with framer-motion scroll
- Brevo email settings with RSVP templates
- Admin RSVP reminder button
- Add to Calendar (Google + ICS) on RSVP success
- SPA deployment redirects

No missing FRs detected. This is a single-file fix.

### Files

| File | Change |
|------|--------|
| `src/pages/Gallery.tsx` | Remove Carousel, use uniform `aspect-square` grid only |

