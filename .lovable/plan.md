

## Phase 2: Gifts & Payments (Paystack + Stripe)

### Overview
Build a full gift registry with dual payment providers: **Paystack** (MoMo, cards, bank transfers — popular in Ghana) and **Stripe** (international cards). Includes a public `/gifts` page with progress tracking, payment flow, and admin management.

### Database Migration (3 new tables)

**`gift_options`** — registry items
- `id` uuid PK, `title` text, `description` text, `target_amount` numeric, `image_url` text, `is_active` boolean default true, `created_at` timestamptz

**`gift_payments`** — payment records
- `id` uuid PK, `gift_option_id` uuid FK→gift_options, `donor_name` text, `donor_email` text, `donor_phone` text, `amount` numeric, `currency` text default 'GHS', `payment_method` text (momo/card/bank), `payment_provider` text (paystack/stripe), `payment_reference` text, `status` text default 'pending' (pending/completed/failed), `created_at` timestamptz

**`payment_settings`** — admin-configurable keys & toggles
- `id` uuid PK, `paystack_public_key` text, `paystack_secret_key` text, `stripe_public_key` text, `stripe_secret_key` text, `momo_enabled` boolean default true, `card_enabled` boolean default true, `bank_enabled` boolean default true, `currency` text default 'GHS', `created_at` timestamptz

RLS: SELECT open on all three (public reads gift_options & payment totals). INSERT on gift_payments for public submissions. All writes via edge function with service role.

### Edge Function: `payment-api`

New edge function handling:
- **`get-gifts`** — public, returns active gift options with aggregated totals from gift_payments (completed only)
- **`initialize-paystack`** — creates Paystack transaction via `https://api.paystack.co/transaction/initialize`, returns authorization_url
- **`verify-paystack`** — verifies payment via `https://api.paystack.co/transaction/verify/:reference`, updates gift_payments status
- **`create-stripe-session`** — creates Stripe Checkout session via Stripe API, returns session URL
- **`verify-stripe`** — verifies Stripe session, updates gift_payments status

Paystack secret key and Stripe secret key read from `payment_settings` table (admin-configurable), NOT from env secrets. This lets the admin update keys from the dashboard without needing developer access.

### Admin Edge Function Updates (`admin-api`)

Add to `get-dashboard`: fetch `gift_options`, `gift_payments`, `payment_settings`.

New actions:
- `insert-gift`, `update-gift`, `delete-gift` — CRUD for gift_options
- `update-payment-settings` — save Paystack/Stripe keys and toggles

### Frontend: `/gifts` Page

- Navigation already has "Gifts" link
- Add route in `App.tsx`
- Gift cards in a responsive grid showing: title, description, image, progress bar (collected/target), "Contribute" button
- **Payment modal flow**:
  1. Enter name, email, phone, amount
  2. Choose payment method (MoMo, Card, Bank — based on admin toggles)
  3. For Paystack: redirect to Paystack checkout (handles MoMo + cards + bank)
  4. For Stripe: redirect to Stripe Checkout
  5. Return URL `/gifts?verify=paystack&reference=xxx` or `/gifts?verify=stripe&session_id=xxx`
  6. On return, verify payment and show thank-you message

### Frontend: Admin Gifts Tab

**`src/components/admin/GiftsTab.tsx`**:
- Gift options CRUD table (add/edit/delete, toggle active)
- Payment history table with filters (status, provider)
- Total collected summary

**`src/components/admin/PaymentSettingsTab.tsx`**:
- Paystack public/secret key inputs
- Stripe public/secret key inputs
- Toggle MoMo, Card, Bank enabled
- Currency selector

### Secrets Approach
No Supabase secrets needed for Paystack/Stripe — keys stored in `payment_settings` table so admin can configure from dashboard. The edge function reads them at runtime.

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/...` | New migration: 3 tables |
| `supabase/functions/payment-api/index.ts` | New edge function |
| `supabase/config.toml` | Add `[functions.payment-api]` |
| `supabase/functions/admin-api/index.ts` | Add gift CRUD + payment settings actions |
| `src/pages/Gifts.tsx` | New page |
| `src/components/admin/GiftsTab.tsx` | New admin tab |
| `src/components/admin/PaymentSettingsTab.tsx` | New admin tab |
| `src/components/admin/AdminDashboard.tsx` | Add Gifts + Payment Settings tabs |
| `src/App.tsx` | Add `/gifts` route |
| `src/integrations/supabase/types.ts` | Auto-updated |

