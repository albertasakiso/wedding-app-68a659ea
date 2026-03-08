

## Admin Dashboard Plan

### Overview
Build a password-protected admin dashboard at `/admin` to manage all wedding data: RSVPs, events, venue info, gallery photos, and view analytics.

### Authentication
- Simple password-based access using a Supabase Edge Function that validates a secret admin password and returns a short-lived token
- Store the admin password as a Supabase secret (`ADMIN_PASSWORD`)
- Admin session stored in sessionStorage (cleared on tab close)
- No Supabase Auth needed -- lightweight approach suitable for a single-admin wedding app

### Database Changes
- Add RLS policies for INSERT/UPDATE/DELETE on `events` and `venue_info` tables (currently read-only)
- Since admin actions go through an Edge Function with service role key, no additional RLS changes needed for admin operations

### Edge Function: `admin-api`
- POST `/admin-api` with action-based routing
- Actions: `login`, `get-dashboard`, `update-event`, `delete-rsvp`, `update-venue`, `upload-photo`, `delete-photo`, `insert-event`, `delete-event`
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Validates admin token on every request (except login)

### Admin Pages & Components

**`/admin` - Login Gate**
- Simple password input, elegant styled to match the wedding theme
- On success, stores token in sessionStorage, renders dashboard

**`/admin` - Dashboard (post-login)**
- Sidebar or tab-based navigation with sections:

1. **Overview Tab** - Summary cards: total RSVPs, attending count, declined count, meal preference breakdown, plus-one count
2. **RSVPs Tab** - Table of all RSVPs with search/filter, export capability, delete action
3. **Events Tab** - List/edit/add/delete timeline events (title, time, location, description, order)
4. **Venue Tab** - Edit venue name, address, map URL, parking info, hotels JSON
5. **Gallery Tab** - View/delete photos, upload new photos (via Supabase Storage bucket)
6. **Messages Tab** - View guest messages from RSVPs

### Tech Approach
- Use `@tanstack/react-query` for data fetching
- All admin data operations go through the `admin-api` Edge Function
- Reuse existing shadcn/ui components (Table, Card, Tabs, Dialog, Input, Button)
- Create a Supabase Storage bucket `gallery` for photo uploads
- Premium styling consistent with wedding theme (gold accents, elegant typography)

### File Structure
```text
src/pages/Admin.tsx          -- Main admin page with login + dashboard
src/components/admin/
  AdminLogin.tsx             -- Password login form
  AdminDashboard.tsx         -- Tab container
  OverviewTab.tsx            -- Stats & summary
  RSVPsTab.tsx               -- RSVP table management
  EventsTab.tsx              -- Event CRUD
  VenueTab.tsx               -- Venue editing
  GalleryTab.tsx             -- Photo management
  MessagesTab.tsx            -- Guest messages
supabase/functions/admin-api/index.ts  -- Edge function
```

### Implementation Order
1. Create `admin-api` Edge Function with login + CRUD actions
2. Create Storage bucket for gallery photos
3. Build AdminLogin component
4. Build AdminDashboard with all tabs
5. Add `/admin` route to App.tsx
6. Wire up all data operations through the Edge Function

