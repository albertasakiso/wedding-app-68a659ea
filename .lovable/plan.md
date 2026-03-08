

## Show Payment Details Directly on Gifts Page

### What
Display the MoMo numbers and bank account details directly on the `/gifts` page instead of hiding them behind a "Contribute" button modal. Remove the gift registry cards with progress bars and target amounts since payments are manual and not tracked through Paystack/Stripe.

### Changes

**`src/pages/Gifts.tsx`**:
- Remove the gift registry grid (the cards with progress bars, target amounts, and "Contribute" buttons)
- Remove the `selectedGift` state, `handleContribute`, and the Dialog modal
- Remove the `get-gifts` fetch call (no longer needed)
- Display the payment details (MTN, Telecel, Bank) directly in the main page section as styled cards
- Keep the "Confirm Your Gift" form directly below the payment details (not in a modal) so donors can still add themselves to the Gift Wall
- Keep the Gift Wall section at the bottom
- Clean up unused imports (`Progress`, `Dialog*`, `GiftOption` interface, etc.)

### Result
Visitors see the page with:
1. Header text
2. Payment details cards (MTN, Telecel, Bank) with copy buttons
3. A simple "Confirm Your Gift" form (name + message)
4. Gift Wall below

