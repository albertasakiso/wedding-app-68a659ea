

## Replace Payment Gateways with Manual Payment Details

### What
Remove Paystack/Stripe payment flow from the Gifts page and replace it with a simple display of your MTN MoMo, Telecel, and GCB Bank account details. Guests will see the account info, send money manually, then optionally confirm their gift (name + gift type) to appear on the Gift Wall.

### Approach

**`src/pages/Gifts.tsx`** — Major rewrite of the payment flow:
- Remove the Paystack/Stripe initialization, verification logic, and payment method radio buttons
- Replace the "Contribute" modal with a modal showing:
  - **MTN MoMo**: 024 6904618
  - **Telecel**: 020 4532502
  - **Bank Transfer**: Account Name: Asakiso Apiligu, Account Number: 8011010337930, Bank: GCB Bank PLC, Swift: GHCBGHAC
- Add a "Confirm Your Gift" form below the details (name, optional message) that inserts directly into `gift_wall` via the payment-api edge function
- Remove URL param verification (no more `?verify=paystack` etc.)
- Remove `PaymentSettings` interface dependency for payment keys

**`supabase/functions/payment-api/index.ts`** — Simplify:
- Add a new action `record-manual-gift` that inserts into `gift_wall` (donor_name, gift_type = 'cash', optional message) and triggers the thank-you email
- Keep `get-gifts` action for the registry display
- The Paystack/Stripe actions can remain but won't be called from the UI

**No database changes needed** — `gift_wall` table already exists with the right schema.

### Files Modified
| File | Change |
|------|--------|
| `src/pages/Gifts.tsx` | Replace payment modal with account details + manual gift confirmation form |
| `supabase/functions/payment-api/index.ts` | Add `record-manual-gift` action |

