import { MapPin, Car, Building, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const hotels = [
  { name: "The Grand Hotel", distance: "0.5 miles", phone: "(555) 123-4567" },
  { name: "Riverside Inn", distance: "1.2 miles", phone: "(555) 234-5678" },
  { name: "Garden View Suites", distance: "2.0 miles", phone: "(555) 345-6789" },
];

const VenueSection = () => {
  return (
    <section id="venue" className="py-24 bg-gradient-to-b from-background to-cream/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">
            The Venue
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Join Us <span className="text-primary">Here</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Our celebration will be held at the beautiful Rosewood Estate, a stunning venue surrounded by lush gardens and timeless elegance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Venue Image & Info */}
          <div className="space-y-6">
            {/* Placeholder for venue image */}
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-champagne to-cream border border-primary/20 overflow-hidden shadow-elegant flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building className="w-12 h-12 text-primary" />
                </div>
                <p className="font-display text-xl text-foreground">Rosewood Estate</p>
                <p className="text-muted-foreground font-body">Venue Photo Coming Soon</p>
              </div>
            </div>

            <div className="bg-card border border-primary/10 rounded-xl p-6 shadow-soft">
              <h3 className="font-display text-2xl text-foreground mb-4">Rosewood Estate</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-body text-foreground">123 Garden Lane</p>
                    <p className="font-body text-muted-foreground">Meadowbrook, CA 90210</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-primary/30 text-foreground hover:bg-primary/10"
                  onClick={() => window.open("https://maps.google.com", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>

          {/* Parking & Hotels */}
          <div className="space-y-6">
            {/* Parking Info */}
            <div className="bg-card border border-primary/10 rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground">Parking Information</h3>
              </div>
              <ul className="space-y-2 font-body text-muted-foreground">
                <li>• Complimentary valet parking available</li>
                <li>• Self-parking in the main lot (200 spaces)</li>
                <li>• Accessible parking near the main entrance</li>
                <li>• Shuttle service from overflow parking</li>
              </ul>
            </div>

            {/* Nearby Hotels */}
            <div className="bg-card border border-primary/10 rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground">Nearby Accommodations</h3>
              </div>
              <p className="text-muted-foreground font-body mb-4">
                We've arranged special rates at these nearby hotels. Mention "Sarah & James Wedding" when booking.
              </p>
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/5"
                  >
                    <div>
                      <p className="font-body text-foreground font-medium">{hotel.name}</p>
                      <p className="text-sm text-muted-foreground">{hotel.distance} away</p>
                    </div>
                    <a
                      href={`tel:${hotel.phone}`}
                      className="text-sm text-primary hover:underline font-body"
                    >
                      {hotel.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueSection;
