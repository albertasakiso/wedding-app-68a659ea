## Goal
Move email collection up the RSVP form so every guest can optionally provide an email for confirmation/decline auto-replies and future gift acknowledgments. Keep "I'd like to receive photos" as a separate opt-in, but require email only when that box is ticked.

## Changes (single file: `src/pages/RSVP.tsx`)

1. **Add an Email field directly after the Phone field** (always visible, optional):
   - Label: "Email Address (Optional)"
   - Helper text: "We'll use this to send your RSVP confirmation and updates about gifts received."
   - Same zod rule as today (valid email or empty).

2. **Remove the duplicate Email field** that currently renders only when `receive_photos` is checked.

3. **Conditional requirement when "receive photos" is ticked**:
   - Update the zod schema with a `superRefine`: if `receive_photos === true` and `email` is empty, attach an error to the `email` field ("Email is required to receive event photos").
   - On submit, if validation fails for that reason, the form already focuses/highlights the email input (react-hook-form behavior) — guest is effectively prompted to enter it.

4. **Submission logic unchanged otherwise**:
   - `data.email || null` already saved on the rsvp row.
   - `email_list` upsert still gated on `receive_photos && data.email`.
   - The existing `send-rsvp-confirmation` edge function call already fires whenever `guest_email` is present, so attending and not-attending auto-replies will now reach any guest who provided an email — no edge function changes needed.

## Out of scope
No DB migration, no edge function edits, no other pages.
