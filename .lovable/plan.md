## Round 9 Plan — Admin enhancements + mobile/UX fixes

### 1. Gift recorder can add manual RSVPs

- **`supabase/functions/admin-api/index.ts`**:
  - Add `insert-rsvp` and `update-rsvp` actions (insert: `guest_name`, `phone`, `email?`, `attending`, `plus_one_name?`, `message?`).
  - Add `clear-rsvp-message` action (sets `message = null` only).
  - Extend `ROLE_PERMS.gift_recorder` to include: `insert-rsvp`, `update-rsvp`, `delete-rsvp`, `clear-rsvp-message`, plus `bulk-delete-rsvp`, `bulk-clear-rsvp-messages`.
- **`AdminDashboard.tsx`**: In the gift-recorder stripped view, add an "RSVPs" tab alongside Gifts/Audit/Contacts.
- **New `RSVPFormDialog`** (small dialog) used by RSVPsTab for add/edit. Reused by both gift-recorder view and full admin view.

### 2. Separate RSVP deletion from message deletion

- **`RSVPsTab.tsx`**:
  - Add a second per-row action: a "Clear message" button (eraser icon) that only nulls the message after confirm (calls `clear-rsvp-message`).
  - Keep the existing trash button for full RSVP delete (red, with stronger confirm).
- **`MessagesTab.tsx`**: Add a "Remove message" button on each card that calls `clear-rsvp-message` — moderators can scrub inappropriate text without losing the RSVP/attendance count.

### 2b. Bulk schema requirement (single migration)

Add bulk delete RPCs aren't needed — edge function will accept arrays. Just add new actions in `admin-api`:
  - `bulk-delete-rsvp` (ids[]), `bulk-clear-rsvp-messages` (ids[])
  - `bulk-delete-photo` (ids[]) — also removes storage objects in a loop.
  - `bulk-delete-subscriber`, `bulk-delete-event`, `bulk-delete-gift`, `bulk-delete-gift-wall`, `bulk-delete-gift-record` (with audit entries).

No DB schema change required; bulk = loop on service-role client.

### 3. Bulk actions in all admin tables

- New shared component **`src/components/admin/BulkSelectionBar.tsx`**: shows "N selected · [Delete] [Clear messages?] · Clear selection" sticky above each table.
- New shared hook **`src/hooks/useRowSelection.ts`**: `selected`, `toggle(id)`, `toggleAll(ids)`, `clear()`, `allSelected`.
- Update each admin tab to add a leading checkbox column + header checkbox + bulk bar:
  - `RSVPsTab` (delete + clear messages)
  - `MessagesTab` (clear messages bulk)
  - `EmailListTab` (delete subscribers)
  - `GalleryTab` (delete photos)
  - `EventsTab` (delete events)
  - `GiftsTab` (delete gift options)
  - `GiftRecordsTab` (delete records — gated to admins; gift_recorder keeps single delete with reason)
- Tables that need a reason (gift_records) prompt once for the batch via existing `ReasonDialog`.

### 4. Mobile / hero fixes

- **Hero "We did it" flash**: `Hero.tsx` currently mounts with default `wedding_date = 2026-05-02` (already past). On first render with `timeLeft.isPast = false`, then settings load → real future date arrives, but in the brief gap between mount and settings fetch the countdown calc may flip to past. Fix: add a `settingsLoaded` state; render the countdown card only after `settingsLoaded === true` (show a skeleton placeholder before then). Also recompute `weddingDate` from latest settings inside the effect.
- **Mobile content behind fixed header**: Add `pt-20 md:pt-24` to top of `Gallery`, `Gifts`, `RSVP`, `MyDay` page wrappers (Hero's own min-h-screen already clears it). Verify `Navigation` height — currently ~64–72px on mobile, so 80px (`pt-20`) is safe.

### Technical notes

- All bulk actions invoke the edge function once per batch (server loops). No client-side multi-roundtrip.
- New audit entries for bulk gift-record deletes write one row per record, sharing the same reason.
- No new secrets, no DB migrations.

### Out of scope

- No changes to public site beyond the 4 page padding fix and Hero loader.
- No edge-function changes to `email-notifications`.
- No new tables.
