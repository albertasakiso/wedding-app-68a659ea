import { Church, Martini, UtensilsCrossed, Music, MapPin, Clock } from "lucide-react";

const events = [
  {
    time: "3:00 PM",
    title: "Ceremony",
    description: "Exchange of vows in the garden pavilion. Please arrive 15 minutes early.",
    location: "Rose Garden Pavilion",
    icon: Church,
  },
  {
    time: "4:00 PM",
    title: "Cocktail Hour",
    description: "Enjoy signature cocktails and hors d'oeuvres while we capture magical moments.",
    location: "Terrace Lounge",
    icon: Martini,
  },
  {
    time: "5:30 PM",
    title: "Reception & Dinner",
    description: "Celebrate with a gourmet dinner, heartfelt toasts, and cherished memories.",
    location: "Grand Ballroom",
    icon: UtensilsCrossed,
  },
  {
    time: "8:00 PM",
    title: "Dancing & Celebration",
    description: "Dance the night away under the stars with live music and entertainment.",
    location: "Grand Ballroom & Terrace",
    icon: Music,
  },
];

const EventTimeline = () => {
  return (
    <section id="schedule" className="py-24 bg-gradient-to-b from-background via-cream/50 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">
            The Day
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Wedding <span className="text-primary">Schedule</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Join us for an unforgettable celebration of love, filled with joy, laughter, and cherished moments.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

          {events.map((event, index) => {
            const Icon = event.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={event.title}
                className={`relative flex items-start gap-8 mb-12 last:mb-0 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Icon */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-soft z-10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <div
                  className={`ml-24 md:ml-0 md:w-1/2 ${
                    isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                  }`}
                >
                  <div className="bg-card/80 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-soft hover:shadow-elegant transition-shadow">
                    <div className={`flex items-center gap-2 mb-2 ${isEven ? "md:justify-end" : ""}`}>
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-primary font-display text-lg font-semibold">
                        {event.time}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-foreground mb-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground font-body mb-3">
                      {event.description}
                    </p>
                    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isEven ? "md:justify-end" : ""}`}>
                      <MapPin className="w-3 h-3" />
                      <span className="font-body">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventTimeline;
