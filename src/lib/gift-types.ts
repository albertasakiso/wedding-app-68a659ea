/**
 * Single source of truth for gift type vocabulary across the app.
 * Used by public Gifts page and admin GiftsTab.
 */
export const GIFT_TYPES = [
  { value: "momo",     label: "MoMo",          shortLabel: "MoMo",         badgeClass: "bg-yellow-100 text-yellow-800" },
  { value: "bank",     label: "Bank Transfer", shortLabel: "Bank",         badgeClass: "bg-blue-100 text-blue-800" },
  { value: "cash",     label: "Cash",          shortLabel: "Cash",         badgeClass: "bg-green-100 text-green-700" },
  { value: "physical", label: "Physical Gift", shortLabel: "Gift",         badgeClass: "bg-purple-100 text-purple-800" },
  { value: "kind",     label: "In Kind",       shortLabel: "In Kind",      badgeClass: "bg-indigo-100 text-indigo-700" },
  { value: "both",     label: "Cash & Kind",   shortLabel: "Cash & Kind",  badgeClass: "bg-pink-100 text-pink-700" },
] as const;

export type GiftTypeValue = (typeof GIFT_TYPES)[number]["value"];

export const giftTypeLabel = (v: string): string =>
  GIFT_TYPES.find((t) => t.value === v)?.label ?? v;

export const giftTypeShortLabel = (v: string): string =>
  GIFT_TYPES.find((t) => t.value === v)?.shortLabel ?? v;

export const giftTypeBadgeClass = (v: string): string =>
  GIFT_TYPES.find((t) => t.value === v)?.badgeClass ?? "bg-muted text-muted-foreground";
