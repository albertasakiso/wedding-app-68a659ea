## Round 4 — Type Safety, Admin Polish & Guest-Day Features

The codebase is now structurally clean (no raw realtime channels, no dead exports, no TODOs). What remains is **type-safety hardening**, a few **admin UX gaps**, and **wedding-day-specific guest features**.

---

### Unconsolidated Modules Found

| # | Location | Issue |
|---|---|---|
| C1 | `AdminDashboard.tsx`, `OverviewTab.tsx`, `MessagesTab.tsx`, `RSVPsTab.tsx` | All admin tabs use `rsvps: any[]` instead of typed rows from `Database["public"]["Tables"]["rsvps"]["Row"]` |
| C2 | `AdminDashboard.tsx` line 28 | `data` from `adminApi("get-dashboard")` is implicitly `any` — no shared `DashboardData` interface |
| C3 | Phone-input duplication | Same `+233 XX XXX XXXX` placeholder in `RSVP.tsx` (×2) and `Gifts.tsx` — no shared `<PhoneInput />` |
| C4 | `MessagesTab.tsx` | Read-only and isolated — no link to the actual sender (clicking a message could open a quick "reply via WhatsApp" using stored phone) |

### Unimplemented / New FRS

| # | Feature | Why it matters |
|---|---|---|
| F1 | **Guest dashboard / "My Day" page** | A single `/my-day` route showing: countdown, current event highlight, venue map, dress code, all in one mobile-optimized card. Useful day-of for guests who don't want to scroll the whole homepage. |
| F2 | **Story/Timeline section** ("How we met") | Most wedding sites have a couple's story. Currently missing. Driven by `site_settings` (new optional `story_milestones jsonb` column). |
| F3 | **Gift wall sort/filter** | `Gifts.tsx` shows wall entries chronologically only. Add filter (cash / kind / both) and sort toggle. Pure client-side. |
| F4 | **Admin search across messages + names** | `MessagesTab` has no search; `OverviewTab` shows totals but no recent activity feed. Add a unified `<RecentActivity />` widget showing last 10 events (RSVPs + gifts + photos) with timestamps. |
| F5 | **404 → friendly wedding-themed not-found** | `NotFound.tsx` is the default Lovable shell — should match brand (gold theme, link back to home). |
| F6 | **Open Graph image** | `index.html` still uses Lovable's default `opengraph-image-p98pqg.png`. WhatsApp/social shares of the invite show generic image — should be branded. |

---

### Implementation

**C1–C2 — Typed admin data**
- Create `src/components/admin/types.ts` exporting `RSVPRow`, `GiftPaymentRow`, `GiftWallRow`, `DashboardData` derived from `Database["public"]["Tables"][...]["Row"]`.
- Update `AdminDashboard.tsx` to type the `useQuery` result; propagate to all tab props.

**C3 — Shared PhoneInput**
- Create `src/components/PhoneInput.tsx` wrapping shadcn `Input` with the GH placeholder, `type="tel"`, and `inputMode="tel"`. Replace 3 call sites.

**C4 — WhatsApp reply on messages**
- In `MessagesTab.tsx`, render an "Open WhatsApp" button on each message card if the RSVP has `phone` (uses `https://wa.me/<digits>`).

**F1 — `/my-day` page**
- New `src/pages/MyDay.tsx` route. Composes existing pieces: `<Hero />` countdown (slim variant), the active event from `EventTimeline` logic (extracted to a shared `useActiveEvent` hook), `<DressCode />`, venue map link.
- Add to `App.tsx` routes and `Navigation.tsx` (mobile-friendly link).

**F2 — Couple's story**
- Migration: add `story_milestones jsonb default '[]'` to `site_settings` (each item: `{ year, title, description, image_url? }`).
- New `src/components/StorySection.tsx` rendering a vertical timeline (reusing `useScrollReveal`).
- Admin: add a "Story" editor section in `SettingsTab.tsx` (add/remove milestones).
- Mount on `Index.tsx` between `VenueSection` and `DressCode`.

**F3 — Gift wall filter/sort**
- In the wall section of `Gifts.tsx`, add `<Tabs>` for All / Cash / Kind / Both and a sort toggle (newest / oldest). Pure `useMemo`.

**F4 — Recent activity feed**
- New `src/components/admin/RecentActivity.tsx` querying last 10 events combining `rsvps`, `gift_payments`, `gallery_photos`, sorted by `created_at`.
- Add to `OverviewTab.tsx` below the stat cards.

**F5 — Branded 404**
- Rewrite `src/pages/NotFound.tsx` with gold theme, broken-heart illustration, link back to `/`.

**F6 — Open Graph image**
- Generate a 1200×630 branded OG image (gold + ivory, "Albert & Ruby · May 2, 2026") into `public/og-image.png`, update `index.html` meta tags.

---

### Files

**New**: `src/pages/MyDay.tsx`, `src/components/StorySection.tsx`, `src/components/PhoneInput.tsx`, `src/hooks/useActiveEvent.ts`, `src/components/admin/types.ts`, `src/components/admin/RecentActivity.tsx`, `public/og-image.png`

**Edited**: `src/App.tsx`, `src/components/Navigation.tsx`, `src/pages/Index.tsx`, `src/pages/RSVP.tsx`, `src/pages/Gifts.tsx`, `src/pages/NotFound.tsx`, `src/components/EventTimeline.tsx`, `src/components/admin/AdminDashboard.tsx`, `src/components/admin/OverviewTab.tsx`, `src/components/admin/MessagesTab.tsx`, `src/components/admin/RSVPsTab.tsx`, `src/components/admin/SettingsTab.tsx`, `index.html`

**Migration**: Add `story_milestones jsonb default '[]'` to `site_settings`.

---

### Out of Scope (future)
- i18n (multi-language) — large surface, low immediate ROI
- QR check-in / digital seating chart — needs new tables + day-of staff workflow
- Drawn guestbook signatures — niche
