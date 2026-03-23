export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  mapUrl?: string;
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(event.endDate)}`,
    details: event.description + (event.mapUrl ? `\n\nMap: ${event.mapUrl}` : ""),
    location: event.location,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function generateICSFile(event: CalendarEvent): string {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding//RSVP//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDateForICS(event.startDate)}`,
    `DTEND:${formatDateForICS(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}${event.mapUrl ? `\\n\\nMap: ${event.mapUrl}` : ""}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return ics;
}

export function downloadICSFile(event: CalendarEvent, filename = "wedding.ics") {
  const ics = generateICSFile(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getGoogleMapsUrl(lat?: number | null, lng?: number | null, address?: string | null): string {
  if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}`;
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return "";
}
