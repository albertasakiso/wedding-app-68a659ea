## Goal

Make the Wedding Schedule timeline (and supporting modules) fully CMS-managed, plus address remaining unconsolidated modules and propose new FRS.

---

## Status check (what's already CMS-driven)

| Module | CMS Tab | Live? |
|---|---|---|
| Events / Timeline | EventsTab | Yes — title, description, time, location, order |
| Venue (Google Maps) | VenueTab | Yes |
| Story Milestones | SettingsTab | Yes |
| Dress code + colors | SettingsTab | Yes |
| Hero / Couple / Date | SettingsTab | Yes |
| Gallery | GalleryTab | Yes |
| Gifts + payments | GiftsTab + PaymentSettingsTab | Yes |
| Email templates | EmailSettingsTab | Yes |

So the Wedding Schedule **is** already CMS-editable. What's NOT editable today: the **per-event icon** (Church/Martini/Utensils/Music) is hardcoded by index, and there is no icon picker. That's the missing piece visible in the screenshot.

---

## Part A — Make the timeline icon CMS-editable (FRS-T1)

**1. DB migration** — extend `events`:
```sql
alter table public.events
  add column if not exists icon text default 'Calendar',
  add column if not exists highlight_color text;
```

**2. `EventsTab.tsx`** — add an icon picker (visual grid of options) to the add/edit dialog. Catalog:
`Church, Heart, Martini, UtensilsCrossed, Music, Camera, Cake, Sparkles, Sun, Moon, Calendar, MapPin, Gift, PartyPopper, Crown, Flower`.
Optional color swatch (defaults to theme primary).

**3. `admin-api/index.ts`** — accept `icon`, `highlight_color` in `insert-event` / `update-event`.

**4. `EventTimeline.tsx`** — replace hardcoded `icons[index % 4]` with `iconMap[event.icon] ?? Calendar`; apply `highlight_color` to ring/border if provided. Default events seeded with sensible icons.

**5. `useActiveEvent.ts`** — extend `TimedEvent` interface with optional `icon`, `highlight_color`.

---

## Part B — Unconsolidated modules to clean up

**B1. `gift_type` vocabulary leak** — `Gifts.tsx` (public) and `GiftsTab.tsx` (admin) each maintain their own labels/colors. Extract to `src/lib/gift-types.ts`:
```ts
export const GIFT_TYPES = [
  { value: 'momo',     label: 'Mobile Money', color: 'yellow' },
  { value: 'bank',     label: 'Bank Transfer', color: 'blue' },
  { value: 'cash',     label: 'Cash',         color: 'green' },
  { value: 'physical', label: 'Physical Gift', color: 'purple' },
  { value: 'kind',     label: 'In-Kind',      color: 'pink' },
  { value: 'both',     label: 'Cash + Gift',  color: 'amber' },
] as const;
export const giftTypeLabel = (v: string) => GIFT_TYPES.find(t => t.value === v)?.label ?? v;
export const giftTypeBadgeClass = (v: string) => /* ... */;
```
Refactor both consumers to import from it.

**B2. Default-events duplication** — `defaultEvents` array duplicated in `EventTimeline.tsx`, `MyDay.tsx` (implicit), and admin-api seed. Move to `src/lib/default-events.ts`.

**B3. Maps URL builder** — `MyDay.tsx` and `VenueSection.tsx` independently build Google Maps URLs from lat/lng/address. Extract `src/lib/maps-utils.ts` with `buildMapsEmbedUrl(venue)` and `buildMapsLinkUrl(venue)`.

**B4. Anonymizer reuse** — `format-utils.ts/anonymizeEntry` exists but `MessagesWall.tsx` still anonymizes inline (verify and switch).

---

## Part C — New FRS proposals (pick what you want)

| ID | Feature | Value |
|---|---|---|
| **FRS-T2** | Live "what's next" banner — sticky pill on `/my-day` showing the next upcoming event countdown | Guest day-of UX |
| **FRS-T3** | Event grouping (Day 1 / Day 2) — add `day_label` column for multi-day weddings | Scales beyond single day |
| **FRS-G1** | Gift goal progress bars per gift_option (sum payments / target) on public Gifts page | Increases conversion |
| **FRS-G2** | Anonymous gift toggle — donor checkbox to hide name on Gift Wall | Privacy |
| **FRS-R1** | RSVP edit link — token-based update via phone OTP (re-uses email/SMS infra) | Reduces admin edits |
| **FRS-R2** | Plus-one cap per RSVP enforced server-side via DB check | Headcount accuracy |
| **FRS-A1** | Admin audit log table (who/what/when on each mutation) | Accountability |
| **FRS-A2** | One-click export: RSVPs → CSV, Gifts → CSV, all from OverviewTab | Operational |
| **FRS-N1** | Daily admin digest email at 8am with new RSVPs/gifts/messages (cron via pg_cron + edge fn) | Saves dashboard checking |
| **FRS-S1** | Public live "Now playing" widget — admin can push current activity ("First dance starting!") visible on `/my-day` | Real-time engagement |

---

## Files affected (Part A + B, the consolidation work)

**New:**
- `supabase/migrations/<ts>_event_icons.sql`
- `src/lib/gift-types.ts`
- `src/lib/default-events.ts`
- `src/lib/maps-utils.ts`
- `src/components/admin/IconPicker.tsx`

**Edited:**
- `src/components/admin/EventsTab.tsx` (icon + color pickers)
- `supabase/functions/admin-api/index.ts` (accept icon/color fields)
- `src/components/EventTimeline.tsx` (use stored icon)
- `src/hooks/useActiveEvent.ts` (extend type)
- `src/pages/Gifts.tsx`, `src/components/admin/GiftsTab.tsx` (use shared gift-types)
- `src/pages/MyDay.tsx`, `src/components/VenueSection.tsx` (use maps-utils)
- `src/integrations/supabase/types.ts` (regenerated after migration)

---

## Recommended scope for this round

**Part A (icon CMS) + Part B (consolidation)** — required and small.
**Plus from Part C:** FRS-G1 (gift progress bars) + FRS-A2 (CSV exports) — high value, low effort.

Reply with which Part C items to include (or "all", "none", or a list like "G1, A2, R1") and I'll implement.