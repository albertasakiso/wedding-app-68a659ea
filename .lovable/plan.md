## Audit: Unconsolidated Modules & FRS Gaps

### Part A — Unconsolidated Modules / Tech Debt

These are already built but live as duplicated or scattered logic. Cleanup is optional but recommended.

| Issue | Location | Consolidation |
|---|---|---|
| `payment-api` edge function still exists from old Paystack/Stripe flow but Gifts page now writes directly to `gift_wall` | `supabase/functions/payment-api/index.ts` | Delete or repurpose — currently dead code |
| `payment_settings` table stores Paystack/Stripe keys never used; only `momo_enabled/card_enabled/bank_enabled` flags read | DB + `PaymentSettingsTab.tsx` | Drop unused key columns; keep only toggles + manual account fields |
| `rsvps.meal_preference` and `rsvps.dietary_restrictions` columns unused (removed from form per memory) | DB | Drop columns or document as legacy |
| Realtime subscriptions duplicated in `Gifts.tsx` (gift + rsvp channels manually) and elsewhere | `src/pages/Gifts.tsx` | Extract `useRealtimeTable(table, onChange)` hook |
| `anonymizeEntry` lives in `image-utils.ts` despite being string logic | `src/lib/image-utils.ts` | Move to `src/lib/format-utils.ts` |
| Admin tab list hardcoded in `AdminDashboard.tsx` | `AdminDashboard.tsx` | Extract `ADMIN_TABS` config array driving both `TabsList` and `TabsContent` |
| Scroll-reveal pattern partially adopted — `Gifts` uses it, `EventTimeline`/`Venue`/`GalleryPreview` use ad-hoc IntersectionObserver | several components | Standardize all on `useScrollReveal` |
| Brevo email sending scattered across `email-notifications` function calls; no shared template renderer | `supabase/functions/email-notifications/` | Extract `renderTemplate(name, vars)` helper |

### Part B — FRS Not Yet Implemented (from prior plans / memory)

1. **Admin RSVP reminder send-all** — memory mentions "Admin RSVP reminder button"; verify it's wired to the Brevo function and shows per-guest send status.
2. **Gift thank-you email** — `email_settings.gift_thankyou_subject/message` exist in DB but no trigger sends them when a `gift_wall` row is inserted with an email. Currently `gift_wall` has no email column → either add `email` column or skip silently.
3. **RSVP edit / cancel link** — guests have no way to update or cancel an RSVP once submitted (no token/magic link).
4. **Photo upload from guests** — `gallery_photos` table allows public INSERT, but the public Gallery page only displays; no upload UI for guests.
5. **Countdown auto-hide post-wedding** — Hero countdown still runs after May 2, 2026; needs "We did it!" state.

### Part C — New FRS Worth Adding

1. **Seating / Table assignment** — admin assigns table number per RSVP; guest can look up their table via phone number on a `/seating` page.
2. **Live event-day timeline (mobile-first "day-of" view)** — strip-down `/today` page that highlights the current/next event based on `events.event_time`.
3. **Multi-language toggle (EN / Twi)** — wedding is in Ghana; add i18n with `react-i18next` and a header switcher.
4. **Share / WhatsApp invite** — "Share invitation" button on Hero that opens WhatsApp/SMS/email with prefilled link + couple names.
5. **Guest dress code section** — new `dress_code` field in `site_settings` rendered as a card on the homepage with color swatches.
6. **Live photo stream / hashtag wall** — guests upload photos during the event; appear instantly on a `/live` projector view.
7. **QR check-in** — admin generates a QR per RSVP for door check-in; check-in status saved to `rsvps.checked_in_at`.
8. **Gift goal progress bars** — `gift_options` already has `target_amount` but Gifts page doesn't show progress; aggregate `gift_wall` totals per gift type and render progress.
9. **Guestbook signature pad** — canvas-based signature capture saved as PNG to `gallery_photos` or a new `guestbook` table.
10. **Push / email reminders** — scheduled Brevo job: T-30, T-7, T-1 day reminders to attending guests.
11. **PWA + offline support** — installable wedding app with cached venue map and timeline.
12. **Analytics dashboard** — admin chart of RSVPs over time, attending vs not, gift totals per day.

### Recommendation

Pick **one cleanup track** (drop dead `payment-api` + unused DB columns + standardize scroll-reveal) and **one feature track** (gift goal progress bars + countdown post-wedding state are highest impact, lowest effort).

Reply with which items you want and I'll implement them.
