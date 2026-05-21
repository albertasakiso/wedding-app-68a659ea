import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Heart, Calendar, CheckCircle2, Gift, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildMapsLinkUrl } from "@/lib/maps-utils";

export default function QrLanding() {
  const [couple, setCouple] = useState("Albert & Ruby");
  const [mapHref, setMapHref] = useState<string>("https://www.google.com/maps");

  useEffect(() => {
    supabase.from("site_settings").select("couple_names").limit(1).maybeSingle().then(({ data }) => {
      if (data?.couple_names) setCouple(data.couple_names);
    });
    supabase.from("venue_info").select("name,address,map_url,latitude,longitude").limit(1).maybeSingle().then(({ data }) => {
      if (data) setMapHref(buildMapsLinkUrl(data as any));
    });
  }, []);

  const choices: Array<{
    icon: typeof Heart;
    title: string;
    desc: string;
    to?: string;
    href?: string;
  }> = [
    { to: "/rsvp", icon: Heart, title: "RSVP", desc: "Let us know if you can join" },
    { to: "/gifts", icon: Gift, title: "Support the Couple", desc: "Send a gift or blessing" },
    { to: "/my-day", icon: Calendar, title: "Programme", desc: "View the full wedding schedule" },
    { href: mapHref, icon: MapPin, title: "Venue Location", desc: "Open the venue map on your device" },
    { to: "/check-in", icon: CheckCircle2, title: "Check In", desc: "Mark your arrival at the venue" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-4xl text-primary mb-2">{couple}</h1>
        <p className="text-muted-foreground mb-8">Welcome — choose what you'd like to do</p>
        <div className="space-y-4">
          {choices.map((c) => {
            const Icon = c.icon;
            const inner = (
              <Card className="p-6 border-primary/20 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display text-lg text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              </Card>
            );
            return c.href ? (
              <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            ) : (
              <Link key={c.title} to={c.to!}>
                {inner}
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-8">Scan once · use anytime during the wedding</p>
      </div>
    </div>
  );
}
