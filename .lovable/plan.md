## Changes

### 1. `src/components/Hero.tsx` — bump couple names font size
- Change the names block wrapper from `font-display text-xl md:text-2xl` to `font-display text-2xl md:text-4xl` for stronger presence.
- Bump the "&" line from `text-lg md:text-xl` to `text-xl md:text-2xl`.
- Keep all other styling (italic first names in primary, fade-in delay 0.35s, spacing) unchanged.

### 2. `src/pages/QrLanding.tsx` — add Venue Location entry
- Insert a new choice between **Programme** and **Check In**:
  - `title`: "Venue Location"
  - `desc`: "Open the venue map on your device"
  - `icon`: `MapPin` (lucide-react)
- Instead of a `<Link>`, render it as an `<a>` with `href` built from `buildMapsLinkUrl()` (`src/lib/maps-utils.ts`) and `target="_blank"`, so it opens the user's native maps app.
- Fetch venue info (name/address/lat/lng/map_url) alongside the existing couple-names fetch, in parallel, with a sensible fallback if it isn't loaded yet (button still renders, just disabled or falls back to address-less query).
- Refactor the `choices` rendering to support both internal `Link` items and external `<a>` items (e.g. add an optional `external: true` + `href` field on the choice object).

No other files, no schema, no styling-system changes.
