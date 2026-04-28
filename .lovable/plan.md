## Final Consolidation + Next-Wave FRS

Audit of remaining gaps after the previous round.

### Unconsolidated Modules Found

| # | Location | Issue |
|---|---|---|
| C1 | `src/pages/Gallery.tsx` (line 68) | Still uses raw `supabase.channel(...)` instead of the new `useRealtimeTable` hook |
| C2 | `src/components/MessagesWall.tsx` (line 98) | Same — raw channel subscription, should use `useRealtimeTable` |
| C3 | `src/components/admin/MessagesTab.tsx` | Read-only list. The "Send All Reminders" / bulk-email flow promised earlier was never wired — no button, no call to `email-notifications` |
| C4 | `src/lib/image-utils.ts` (line 64) | Re-exports `anonymizeEntry` for "backward compatibility" but no consumer still imports from here — dead re-export, can be removed |
| C5 | `src/pages/Gallery.tsx` (line 183) | Hardcoded "Photos coming soon" copy — should fall back gracefully now that guests can upload |

### Unimplemented / New FRS

| # | Feature | Why it matters |
|---|---|---|
| F1 | **Bulk RSVP reminder** in admin | Promised in earlier plan, never built. Admin selects "not yet RSVPed" segment → triggers `email-notifications` with reminder template |
| F2 | **Gift wall moderation** | `gift_wall.is_visible` column exists but admin has no UI to toggle/hide entries. Add hide/show actions in `GiftsTab` |
| F3 | **RSVP "View my RSVP"** lookup | Guests have no way to confirm or update. Add phone-based lookup on `/rsvp` showing their submitted entry |
| F4 | **Live event-day timeline highlight** | On wedding day, `EventTimeline` should auto-highlight the current/next event using `event_time` vs `now()` |
| F5 | **PWA install prompt** | Add `manifest.json` + service worker stub so guests can "Add to Home Screen" — high engagement, low effort |

---

### Implementation

**Consolidation (C1–C5)**
- Refactor `Gallery.tsx` and `MessagesWall.tsx` to call `useRealtimeTable("gallery_photos", refetch)` / `useRealtimeTable("gift_wall", refetch)`.
- Remove the dead re-export in `image-utils.ts`.
- Replace empty-gallery copy with: "Be the first to share a moment — upload above."

**F1 — Bulk reminders (`MessagesTab.tsx` → rename concept to "Outreach")**
- Add tabs: *Messages from guests* | *Send reminder*.
- "Send reminder" filters RSVPs where `attending IS NULL` (or all email_list subscribers), shows count, has a "Send to N guests" button calling `email-notifications` with action `send_bulk_reminder`.
- Extend `email-notifications` edge function with a `send_bulk_reminder` action that loops through recipients using existing `rsvp_reminder_subject/message` from `email_settings`.

**F2 — Gift wall moderation (`GiftsTab.tsx`)**
- Add a "Wall entries" sub-section listing `gift_wall` rows with an Eye/EyeOff toggle.
- Migration: add UPDATE policy on `gift_wall` for the admin (via service-role through `admin-api` edge function action `toggle_gift_wall_visibility`).

**F3 — RSVP lookup (`RSVP.tsx`)**
- Add a small "Already RSVPed? Look up" link → dialog with phone input → queries `rsvps` by phone → shows status. Read-only (matches existing RLS).

**F4 — Live timeline (`EventTimeline.tsx`)**
- Compute current/upcoming event by comparing `event_time` to `Date.now()`. Add a pulsing gold ring on the active card.
- Pure client logic, no schema change.

**F5 — PWA**
- Add `public/manifest.json` (couple names, gold theme color, icons reused from `hero_image_url`).
- Link manifest in `index.html`. Add minimal service worker (`public/sw.js`) for offline shell caching.
- Register SW in `main.tsx`.

---

### Files

**Edit**: `src/pages/Gallery.tsx`, `src/components/MessagesWall.tsx`, `src/lib/image-utils.ts`, `src/components/admin/MessagesTab.tsx`, `src/components/admin/GiftsTab.tsx`, `src/pages/RSVP.tsx`, `src/components/EventTimeline.tsx`, `supabase/functions/email-notifications/index.ts`, `supabase/functions/admin-api/index.ts`, `index.html`, `src/main.tsx`

**Create**: `public/manifest.json`, `public/sw.js`

**Migration**: Add admin-only UPDATE flow for `gift_wall.is_visible` (handled via admin-api with service role; no new RLS policy needed).

---

### Out of Scope (deferred for future rounds)
- Multi-language (i18n) — large surface area
- QR check-in / seating lookup — requires new tables + admin tooling
- Digital guestbook signature drawing — niche
