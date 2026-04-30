import {
  Calendar, Church, Heart, Martini, UtensilsCrossed, Music, Camera, Cake,
  Sparkles, Sun, Moon, MapPin, Gift, PartyPopper, Crown, Flower,
  type LucideIcon,
} from "lucide-react";

/**
 * Catalog of icons that admins can pick for timeline events.
 * Stored as the string key in events.icon column.
 */
export const EVENT_ICONS: Record<string, LucideIcon> = {
  Calendar, Church, Heart, Martini, UtensilsCrossed, Music, Camera, Cake,
  Sparkles, Sun, Moon, MapPin, Gift, PartyPopper, Crown, Flower,
};

export const EVENT_ICON_NAMES = Object.keys(EVENT_ICONS) as Array<keyof typeof EVENT_ICONS>;

export const getEventIcon = (name?: string | null): LucideIcon =>
  (name && EVENT_ICONS[name]) || Calendar;
