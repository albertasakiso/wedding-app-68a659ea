

## Public Gift Wall

### What
Add a "Gift Wall" section to the `/gifts` page showing all donors publicly. Each entry shows only the donor's name and a gift type badge (Cash, Kind, or Both) — no amounts. Admin can also record physical/in-kind gifts from the dashboard.

### Database Changes

**New table: `gift_wall`**
- `id` uuid PK default gen_random_uuid()
- `donor_name` text NOT NULL
- `gift_type` text NOT NULL default 'cash' (values: 'cash', 'kind', 'both')
- `message` text (optional short note like "God bless you")
- `is_visible` boolean default true (admin can hide entries)
- `created_at` timestamptz default now()

RLS: public SELECT where `is_visible = true`, no public INSERT/UPDATE/DELETE.

**Auto-populate from gift_payments**: When a payment is verified (status = 'completed'), insert a `gift_wall` entry with `gift_type = 'cash'` via the payment-api edge function.

### Edge Function Updates

**`payment-api`**: After marking a payment as completed (Paystack/Stripe verify), also insert into `gift_wall` with donor_name and `gift_type = 'cash'`.

**`admin-api`**: Add actions:
- `get-gift-wall` — fetch all gift_wall entries (admin sees all including hidden)
- `insert-gift-wall` — admin manually records physical gifts (name, gift_type = 'kind'/'both', optional message)
- `update-gift-wall` — toggle visibility or update gift_type
- `delete-gift-wall` — remove entry

Include `gift_wall` in `get-dashboard` response.

### Frontend Changes

**`src/pages/Gifts.tsx`**: Add a "Gift Wall" section below the registry grid. Shows a beautiful card/tile layout with:
- Donor name
- Badge: "Cash", "Kind", or "Both" (styled with soft colors)
- Optional thank-you message
- No amounts displayed anywhere

**`src/components/admin/GiftsTab.tsx`**: Add a "Gift Wall" management section:
- Table of all entries with visibility toggle
- "Record Physical Gift" button — opens modal to enter donor name, select gift type (kind/both/cash), optional message
- Delete option

### Files to Create/Modify
| File | Action |
|------|--------|
| `supabase/migrations/...` | New: `gift_wall` table |
| `supabase/functions/payment-api/index.ts` | Auto-insert into gift_wall on verified payment |
| `supabase/functions/admin-api/index.ts` | Add gift_wall CRUD actions |
| `src/pages/Gifts.tsx` | Add Gift Wall display section |
| `src/components/admin/GiftsTab.tsx` | Add Gift Wall admin management |
| `src/integrations/supabase/types.ts` | Auto-updated |

