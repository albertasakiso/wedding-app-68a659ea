

## Add Phone Number + Email List for Post-Event Photo Sharing

### 1. Database Migration

Add `phone` column to the `rsvps` table:
```sql
ALTER TABLE public.rsvps ADD COLUMN phone text;
```

Create `email_list` table for collecting emails of people who want post-event photos:
```sql
CREATE TABLE public.email_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subscribed boolean NOT NULL DEFAULT true,
  source text DEFAULT 'rsvp',  -- 'rsvp' or 'manual'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);
-- RLS: public read for admin via edge function, public insert
ALTER TABLE public.email_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.email_list FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read email list" ON public.email_list FOR SELECT USING (true);
```

### 2. RSVP Form Updates (`src/pages/RSVP.tsx`)

- Add `phone` field to zod schema (optional, max 20 chars, basic phone regex)
- Add phone input field after email field
- Add a checkbox: "I'd like to receive photos from the event"
- On submit: insert into `rsvps` with phone, and if checkbox is checked, also upsert into `email_list`

### 3. Admin Dashboard — RSVPs Tab (`src/components/admin/RSVPsTab.tsx`)

- Add "Phone" column to the RSVP table display
- Include phone in CSV export

### 4. Admin Dashboard — New Email List Tab

Create `src/components/admin/EmailListTab.tsx`:
- Table showing all email list subscribers (name, email, phone, source, date)
- Search/filter functionality
- Export email list as CSV (for importing into Brevo or other email tools)
- Manual add subscriber form
- Delete subscriber button
- Stats: total subscribers count

### 5. Admin Dashboard Integration (`AdminDashboard.tsx`)

- Add "Email List" tab with Mail icon
- Fetch email list data in dashboard query
- Update edge function `admin-api` with:
  - `get-email-list` action
  - `add-subscriber` action
  - `delete-subscriber` action

### 6. Edge Function Updates (`supabase/functions/admin-api/index.ts`)

Add handlers for email list CRUD operations, and include `email_list` data in the `get-dashboard` response.

### Files Modified
- `supabase/migrations/` — new migration for `phone` column + `email_list` table
- `src/pages/RSVP.tsx` — phone field + photo subscription checkbox
- `src/components/admin/RSVPsTab.tsx` — phone column in table + CSV
- `src/components/admin/EmailListTab.tsx` — new file
- `src/components/admin/AdminDashboard.tsx` — add Email List tab
- `src/integrations/supabase/types.ts` — auto-updated after migration
- `supabase/functions/admin-api/index.ts` — email list CRUD

