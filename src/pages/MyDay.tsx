import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DressCode from "@/components/DressCode";
import { Heart, MapPin, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveEvent, type TimedEvent } from "@/hooks/useActiveEvent";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { buildMapsLinkUrl } from "@/lib/maps-utils";

interface Settings {
  couple_names: string;
  wedding_date: string;
  tagline: string | null;
}
interface Venue {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function MyDay() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<TimedEvent[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    Promise.all([
      supabase.from("site_settings").select("couple_names, wedding_date, tagline").limit(1).single(),
      supabase.from("venue_info").select("name, address, latitude, longitude").limit(1).single(),
      supabase.from("events").select("id, title, description, event_time, location").order("order_index", { ascending: true }),
    ]).then(([s, v, e]) => {
      if (s.data) setSettings(s.data);
      if (v.data) setVenue(v.data);
      if (e.data) setEvents(e.data);
    });
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { activeEvent } = useActiveEvent(events);

  const target = settings ? new Date(settings.wedding_date).getTime() : 0;
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff / 3_600_000) % 24);
  const mins = Math.floor((diff / 60_000) % 60);
  void tick;

  const mapsUrl =
    venue?.latitude && venue?.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
      : venue?.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
        : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          {/* Hero card */}
          <div className="bg-card border border-primary/20 rounded-2xl p-8 shadow-elegant text-center">
            <Heart className="w-8 h-8 text-primary fill-primary/20 mx-auto mb-3" />
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              {settings?.couple_names || "Albert & Ruby"}
            </h1>
            <p className="text-muted-foreground font-body mt-2">{settings?.tagline}</p>

            {diff > 0 ? (
              <div className="mt-6 flex justify-center gap-4 text-center">
                {[
                  { v: days, l: "Days" },
                  { v: hours, l: "Hours" },
                  { v: mins, l: "Mins" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p className="font-display text-3xl text-primary font-semibold">{String(v).padStart(2, "0")}</p>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase">{l}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 font-display text-2xl text-primary">Today's the day! 💛</p>
            )}
          </div>

          {/* Active event */}
          {activeEvent && (
            <div className="bg-primary/5 border-2 border-primary/40 rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-sans">Happening Now</span>
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {new Date(activeEvent.event_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
              </div>
              <h2 className="font-display text-2xl text-foreground">{activeEvent.title}</h2>
              {activeEvent.description && <p className="text-muted-foreground font-body mt-1">{activeEvent.description}</p>}
              {activeEvent.location && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {activeEvent.location}
                </p>
              )}
            </div>
          )}

          {/* Venue + actions */}
          {venue && (
            <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl text-foreground">{venue.name}</h2>
              </div>
              {venue.address && <p className="text-muted-foreground font-body text-sm">{venue.address}</p>}
              {mapsUrl && (
                <Button asChild className="mt-4 w-full" variant="outline">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Open in Maps</a>
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline"><Link to="/gallery"><Calendar className="w-4 h-4 mr-2" /> Gallery</Link></Button>
            <Button asChild variant="outline"><Link to="/gifts"><Heart className="w-4 h-4 mr-2" /> Send a Gift</Link></Button>
          </div>
        </div>

        <DressCode />
      </main>
      <Footer />
    </div>
  );
}
