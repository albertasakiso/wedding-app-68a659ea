/**
 * Date helpers driven by `site_settings.wedding_date`.
 * Use these everywhere instead of hardcoding "May 2nd, 2026" etc.
 */

const DEFAULT_WEDDING_ISO = "2026-05-02T15:00:00Z";

export function parseWeddingDate(input?: string | null): Date {
  if (!input) return new Date(DEFAULT_WEDDING_ISO);
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date(DEFAULT_WEDDING_ISO) : d;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export type DateStyle = "long" | "short" | "weekday" | "ordinal" | "iso" | "year";

export function formatWeddingDate(input?: string | null, style: DateStyle = "long"): string {
  const d = parseWeddingDate(input);
  switch (style) {
    case "short":
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    case "weekday":
      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    case "ordinal":
      // e.g. "May 2nd, 2026"
      return `${d.toLocaleDateString("en-US", { month: "long" })} ${ordinal(d.getDate())}, ${d.getFullYear()}`;
    case "iso":
      return d.toISOString();
    case "year":
      return String(d.getFullYear());
    case "long":
    default:
      return `${d.toLocaleDateString("en-US", { month: "long" })} ${ordinal(d.getDate())}, ${d.getFullYear()}`;
  }
}

/** Returns a date N days before the wedding (e.g. RSVP-by deadline). */
export function rsvpByDate(weddingIso?: string | null, daysBefore = 30): Date {
  const d = parseWeddingDate(weddingIso);
  d.setDate(d.getDate() - daysBefore);
  return d;
}

export function formatRsvpBy(weddingIso?: string | null, daysBefore = 30): string {
  const d = rsvpByDate(weddingIso, daysBefore);
  return `${d.toLocaleDateString("en-US", { month: "long" })} ${ordinal(d.getDate())}, ${d.getFullYear()}`;
}
