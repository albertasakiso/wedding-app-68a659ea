import { useEffect, useState } from "react";
import { Church, Martini, UtensilsCrossed, Music, MapPin, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const iconMap: Record<string, any> = {
  Church, Martini, UtensilsCrossed, Music, Calendar,
};

const defaultEvents = [
  { id: "1", event_time: "2026-05-02T15:00:00Z", title: "Ceremony", description: "Exchange of vows in the garden pavilion.", location: "Rose Garden Pavilion" },
  { id: "2", event_time: "2026-05-02T16:00:00Z", title: "Cocktail Hour", description: "Enjoy signature cocktails and hors d'oeuvres.", location: "Terrace Lounge" },
  { id: "3", event_time: "2026-05-02T17:30:00Z", title: "Reception & Dinner", description: "Celebrate with a gourmet dinner and toasts.", location: "Grand Ballroom" },
  { id: "4", event_time: "2026-05-02T20:00:00Z", title: "Dancing & Celebration", description: "Dance the night away under the stars.", location: "Grand Ballroom & Terrace" },
];

function TimelineCard({ event, index }: { event: typeof defaultEvents[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const isEven = index % 2 === 0;
  const icons = [Church, Martini, UtensilsCrossed, Music];
  const Icon = icons[index % icons.length];
  const time = new Date(event.event_time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-8 mb-12 last:mb-0 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-soft z-10">
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
      </div>

      <div className={`ml-28 md:ml-0 md:w-1/2 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
        <div className="bg-card/80 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-soft hover:shadow-elegant transition-shadow">
          <div className={`flex items-center gap-2 mb-2 ${isEven ? "md:justify-end" : ""}`}>
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-primary font-display text-lg font-semibold">{time}</span>
          </div>
          <h3 className="font-display text-2xl text-foreground mb-2">{event.title}</h3>
          <p className="text-muted-foreground font-body mb-3">{event.description}</p>
          {event.location && (
            <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isEven ? "md:justify-end" : ""}`}>
              <MapPin className="w-3 h-3" />
              <span className="font-body">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EventTimeline = () => {
  const [events, setEvents] = useState(defaultEvents);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("order_index", { ascending: true });
      if (data && data.length > 0) setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <section id="schedule" className="py-24 bg-gradient-to-b from-background via-cream/50 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">The Day</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Wedding <span className="text-primary">Schedule</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Join us for an unforgettable celebration of love, filled with joy, laughter, and cherished moments.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          {events.map((event, index) => (
            <TimelineCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventTimeline;
