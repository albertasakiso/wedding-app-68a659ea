import { useEffect, useState } from "react";
import { MapPin, Car, Building, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Hotel {
  name: string;
  distance: string;
  phone?: string;
  url?: string;
}

interface VenueData {
  name: string;
  address: string | null;
  map_url: string | null;
  parking_info: string | null;
  hotels: Hotel[];
  latitude: number | null;
  longitude: number | null;
}

const defaultVenue: VenueData = {
  name: "Rosewood Estate",
  address: "123 Garden Lane, Meadowbrook, CA 90210",
  map_url: null,
  parking_info: "• Complimentary valet parking available\n• Self-parking in the main lot (200 spaces)\n• Accessible parking near the main entrance",
  hotels: [
    { name: "The Grand Hotel", distance: "0.5 miles", phone: "(555) 123-4567" },
    { name: "Riverside Inn", distance: "1.2 miles", phone: "(555) 234-5678" },
    { name: "Garden View Suites", distance: "2.0 miles", phone: "(555) 345-6789" },
  ],
  latitude: null,
  longitude: null,
};

const VenueSection = () => {
  const [venue, setVenue] = useState<VenueData>(defaultVenue);

  useEffect(() => {
    const fetchVenue = async () => {
      const { data } = await supabase
        .from("venue_info")
        .select("*")
        .limit(1)
        .single();
      if (data) {
        setVenue({
          name: data.name,
          address: data.address,
          map_url: data.map_url,
          parking_info: data.parking_info,
          hotels: (data.hotels as unknown as Hotel[]) || [],
          latitude: (data as any).latitude,
          longitude: (data as any).longitude,
        });
      }
    };
    fetchVenue();
  }, []);

  const parkingLines = venue.parking_info?.split("\n").filter(Boolean) || [];
  const hasMap = venue.latitude && venue.longitude;
  const mapEmbedUrl = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${venue.longitude! - 0.01},${venue.latitude! - 0.005},${venue.longitude! + 0.01},${venue.latitude! + 0.005}&layer=mapnik&marker=${venue.latitude},${venue.longitude}`
    : null;
  const mapLinkUrl = hasMap
    ? `https://www.openstreetmap.org/?mlat=${venue.latitude}&mlon=${venue.longitude}#map=16/${venue.latitude}/${venue.longitude}`
    : venue.map_url || "https://maps.google.com";

  return (
    <section id="venue" className="py-24 bg-gradient-to-b from-background to-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">The Venue</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Join Us <span className="text-primary">Here</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Our celebration will be held at the beautiful {venue.name}, a stunning venue surrounded by lush gardens and timeless elegance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-6">
            {/* Map or placeholder */}
            {mapEmbedUrl ? (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-primary/20 shadow-elegant">
                <iframe
                  src={mapEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  title={`Map of ${venue.name}`}
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-champagne to-cream border border-primary/20 overflow-hidden shadow-elegant flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Building className="w-12 h-12 text-primary" />
                  </div>
                  <p className="font-display text-xl text-foreground">{venue.name}</p>
                  <p className="text-muted-foreground font-body">Venue Photo Coming Soon</p>
                </div>
              </div>
            )}

            <div className="bg-card border border-primary/10 rounded-xl p-6 shadow-soft">
              <h3 className="font-display text-2xl text-foreground mb-4">{venue.name}</h3>
              <div className="space-y-4">
                {venue.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="font-body text-foreground">{venue.address}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-primary/30 text-foreground hover:bg-primary/10"
                  onClick={() => window.open(mapLinkUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {parkingLines.length > 0 && (
              <div className="bg-card border border-primary/10 rounded-xl p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground">Parking Information</h3>
                </div>
                <ul className="space-y-2 font-body text-muted-foreground">
                  {parkingLines.map((line, i) => (
                    <li key={i}>{line.startsWith("•") ? line : `• ${line}`}</li>
                  ))}
                </ul>
              </div>
            )}

            {venue.hotels.length > 0 && (
              <div className="bg-card border border-primary/10 rounded-xl p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground">Nearby Accommodations</h3>
                </div>
                <p className="text-muted-foreground font-body mb-4">
                  We've arranged special rates at these nearby hotels. Mention "Albert & Ruby Wedding" when booking.
                </p>
                <div className="space-y-3">
                  {venue.hotels.map((hotel) => (
                    <div
                      key={hotel.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/5"
                    >
                      <div>
                        <p className="font-body text-foreground font-medium">{hotel.name}</p>
                        <p className="text-sm text-muted-foreground">{hotel.distance} away</p>
                      </div>
                      {hotel.phone ? (
                        <a href={`tel:${hotel.phone}`} className="text-sm text-primary hover:underline font-body">
                          {hotel.phone}
                        </a>
                      ) : hotel.url ? (
                        <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-body">
                          Book Now
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueSection;
