/**
 * Shared Google Maps URL builders used by VenueSection and MyDay.
 * Embed URL works without an API key. Universal link opens the user's native maps app.
 */
export interface MapsVenue {
  name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  map_url?: string | null;
}

function mapsQuery(v: MapsVenue): string {
  if (v.latitude != null && v.longitude != null) return `${v.latitude},${v.longitude}`;
  return v.address || v.name || "";
}

export function buildMapsEmbedUrl(v: MapsVenue): string {
  const q = mapsQuery(v);
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
}

export function buildMapsLinkUrl(v: MapsVenue): string {
  if (v.map_url) return v.map_url;
  const q = mapsQuery(v);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
