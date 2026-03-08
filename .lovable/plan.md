

## Remove Meal & Dietary Restrictions from RSVP Form

Remove the `meal_preference` and `dietary_restrictions` fields from the RSVP form and submission logic.

### Changes

**`src/pages/RSVP.tsx`**:
- Remove `meal_preference` and `dietary_restrictions` from the zod schema
- Remove them from `defaultValues`
- Remove the two `<FormField>` blocks for meal preference (Select) and dietary restrictions (Input)
- Remove them from the `supabase.from("rsvps").insert(...)` call
- Remove them from the email notification payload

**`src/components/admin/OverviewTab.tsx`**:
- Remove the meal preferences summary card (the one iterating over `meals`)
- Remove the `Utensils` icon import

No database migration needed — the columns can stay in the table, we just stop writing to them.

