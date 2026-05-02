## Round 5 Plan — Unified Gifts, Roles, Audit Log, Contact List, QR Code

### 1. Event Icon Picker (already done — verification)
The `IconPicker` is already wired into `EventsTab`. When you click "Add Event", a 16-icon grid (Church, Martini, Cake, Music, etc.) appears with click-to-select. No code change needed — this was delivered in Round 4. I'll add a brief note in the dialog clarifying that the icon is required.

### 2. Unified Gift Registry (replace dual "Gifts vs Physical Gift" UI)
Right now there are two confusing flows: `gift_options` (digital registry items) and `gift_wall` (manual physical entries). I'll **merge them into one "Gifts Received" ledger** that records every gift the couple actually receives.

**New table: `gift_records`** (replaces the public-facing role of `gift_wall`; `gift_options` stays only as registry catalog the couple advertises)
- `id`, `created_at`, `updated_at`
- `donor_type` — `individual` | `family` | `group` | `anonymous`
- `donor_name` (e.g. "The Mensah Family", "Akua Boateng")
- `donor_phone`, `donor_email` (optional; feeds contact list)
- `gift_type` — `cash` | `momo` | `bank` | `physical` | `in_kind` (consolidated using existing `GIFT_TYPES` vocab)
- `amount` (numeric, nullable — only for cash/momo/bank)
- `currency` (default `GHS`)
- `description` (text — "set of dinner plates", "fridge", etc.)
- `received_by` (text — who collected it on the day)
- `received_at` (timestamp)
- `notes` (internal)
- `is_visible_on_wall` (bool, default true) — controls public Gift Wall display
- `thank_you_sent` (bool, default false)
- `created_by_user_id`, `last_modified_by_user_id`

**Admin UI** (`GiftsTab.tsx` rewrite):
- Single "Add Gift Received" button (no more Add Gift / Record Physical Gift split)
- Form: Donor Type → Name → Phone/Email → Gift Type → (conditional) Amount → Description → Received by → Notes → Visible on public wall toggle
- Filters: type, donor type, date range, thank-you status
- Bulk actions: mark thank-you sent, export CSV
- Edit/Delete require **reason** (modal asks "Why?") — recorded in audit log
- "Gift Registry" (the `gift_options` catalog of suggested items) becomes a smaller secondary section labelled "Suggested Registry Items (public page)"

**Public `Gifts.tsx`**: Wall reads from `gift_records` where `is_visible_on_wall=true`, anonymized as today.

### 3. Audit Log (FRS-A1)
**New table: `gift_audit_log`**
- `id`, `created_at`
- `record_id` (uuid of gift_records row, nullable for hard-deletes)
- `action` — `create` | `update` | `delete`
- `actor_user_id`, `actor_name`
- `actor_role` (snapshot)
- `reason` (text, required for update/delete)
- `before` (jsonb), `after` (jsonb) — full snapshots
- Triggers on `gift_records` auto-write before/after; admin-api passes `actor` + `reason` via session context (`SET LOCAL app.actor = ...`)

**Admin UI**: New "Audit Log" sub-tab inside Gifts showing chronological diffs with actor, reason, and a side-by-side before/after view. Read-only. Never deleted.

### 4. Roles & User Management (FRS-U1)
Following Lovable security rules — roles in a separate table, never on profiles.

**New tables**:
- `app_role` enum: `super_admin`, `admin`, `gift_recorder`, `viewer`
- `admin_users` — `id`, `email`, `name`, `phone`, `is_active`, `created_at`
- `user_roles` — `user_id` → `admin_users.id`, `role app_role`, unique(user_id, role)
- `has_role(user_id, role)` security-definer function

**Auth**: Move from single `ADMIN_PASSWORD` to per-user passwords (bcrypt hash stored on `admin_users.password_hash`). Login form takes email + password. Session token encodes `user_id` + role. Existing `ADMIN_PASSWORD` becomes the bootstrap super-admin.

**Role permissions**:
| Role | Sees | Can do |
|---|---|---|
| super_admin | Everything + Users tab | Everything incl. role assignment |
| admin | Everything except Users tab | Edit all data (with reason logged) |
| gift_recorder | **Only the Gifts tab** | Add gifts, edit/delete own entries with reason |
| viewer | Everything | Read-only |

**Admin UI**: New "Users" sub-tab (super_admin only) — invite user (email + initial password + role), toggle active, change role. Sidebar/tabs filter dynamically based on role; gift_recorder lands directly on a stripped-down Gifts page with no other navigation.

### 5. Contact List Export (FRS-C1)
New "Contacts" tab consolidating every name/phone/email the wedding has touched:
- Sources: `rsvps`, `gift_records`, `gift_wall` (legacy), `messages`, `email_list`
- Deduplicated by phone (preferred) or email
- Columns: Name, Phone, Email, Source(s), RSVP'd?, Gave gift?, Sent message?, Last seen
- Filters: source, attended, gave gift
- Three export buttons:
  - **Thank-you list** (gave a gift) — CSV with name, phone, email, gift summary
  - **Photo-share list** (attended) — CSV
  - **Full contacts** — CSV
- Powered by a new view `v_contacts` joining the source tables

### 6. QR Code Generator (FRS-Q1)
**New "QR Code" tab** in admin:
- Single QR code that points to a smart landing route `/qr` on the site
- `/qr` page shows three big buttons in wedding theme:
  1. **RSVP** → `/rsvp`
  2. **View Programme / My Day** → `/my-day`
  3. **Check In** → triggers a check-in flow
- Check-in flow: phone input → matches an existing RSVP → marks `checked_in_at` on `rsvps` (new column) → confirmation screen. If no RSVP found, lets them RSVP on the spot.
- Admin tab features:
  - Live preview of the QR (using `qrcode` npm package, generated client-side)
  - Adjustable size, margin, foreground color (default gold `#D4AF37`), optional center logo
  - "Download PNG" and "Download SVG" buttons (high-res for the flyer)
  - URL displayed below for manual sharing
- New "Check-ins" view in Overview tab: count of guests checked in / total attending, plus a list of recent check-ins.

**Migration adds**: `rsvps.checked_in_at timestamptz`, `rsvps.checked_in_by text`.

### Files

**New**
- `supabase/migrations/<ts>_gift_records_audit_roles_qr.sql` (all schema changes + triggers + RLS + bootstrap super_admin)
- `src/components/admin/GiftRecordsTab.tsx` (replaces unified gift list)
- `src/components/admin/GiftAuditLogTab.tsx`
- `src/components/admin/UsersTab.tsx`
- `src/components/admin/ContactsTab.tsx`
- `src/components/admin/QRCodeTab.tsx`
- `src/components/admin/ReasonDialog.tsx` (reusable "why are you editing/deleting?" modal)
- `src/pages/QrLanding.tsx` (`/qr` route)
- `src/pages/CheckIn.tsx` (`/check-in` route)
- `src/lib/auth-context.tsx` (current user + role + permission helpers)
- `src/lib/qr-utils.ts` (QR generation + download)

**Edited**
- `supabase/functions/admin-api/index.ts` — new actions: `login-v2`, `list-users`, `invite-user`, `update-user-role`, `deactivate-user`, `insert-gift-record`, `update-gift-record` (with reason), `delete-gift-record` (with reason), `list-audit-log`, `list-contacts`, `mark-checked-in`. Auth switches to per-user token.
- `src/components/admin/AdminDashboard.tsx` — role-gated tabs, new tabs added
- `src/components/admin/AdminLogin.tsx` — email + password
- `src/pages/Gifts.tsx` — read wall from `gift_records`
- `src/App.tsx` — add `/qr`, `/check-in` routes
- `src/lib/admin-api.ts` — token now carries user identity

**Dependencies**
- Add `qrcode` (and `@types/qrcode`) for QR generation
- Add `bcryptjs` (for edge function password hashing — Deno-compatible build)

### Notes / Trade-offs
- The legacy `gift_wall` table is preserved and read-only; new entries go to `gift_records`. A one-time migration copies existing `gift_wall` rows into `gift_records`.
- Super-admin is bootstrapped automatically using the current `ADMIN_PASSWORD` secret + an email you'll set in the migration (I'll prompt you on first login to change the password).
- QR generation is fully client-side (no external API), so the downloaded PNG/SVG works offline for the printer.
- All edits/deletes — by any role — are logged. Even super_admin cannot bypass the reason prompt.

Approve to proceed.