import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ShareInvite from "@/components/ShareInvite";
import Logo from "@/components/Logo";
import { formatWeddingDate } from "@/lib/date-utils";

interface SiteSettings {
  couple_names: string;
  wedding_date: string;
  tagline: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const Hero = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    couple_names: "Albert & Ruby",
    wedding_date: "2026-06-13T11:00:00Z",
    tagline: "Together with their families",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("couple_names, wedding_date, tagline")
        .limit(1)
        .single();
      if (data) setSettings(data);
      setSettingsLoaded(true);
    };
    fetchSettings();
  }, []);

  const weddingDate = new Date(settings.wedding_date);
  const names = settings.couple_names.split("&").map((n) => n.trim());
  const dateStr = formatWeddingDate(settings.wedding_date, "ordinal");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isPast: false,
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [settings.wedding_date]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-cream to-background">
      {/* Decorative elements with GPU hints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 md:w-64 h-40 md:h-64 rounded-full bg-primary/5 blur-3xl animate-float will-change-transform" />
        <div className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 rounded-full bg-champagne/30 blur-3xl animate-float will-change-transform" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 right-1/4 w-20 md:w-32 h-20 md:h-32 rounded-full bg-blush/20 blur-2xl animate-float will-change-transform" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Ornamental borders — hidden on small screens */}
      <div className="hidden md:block absolute top-8 left-8 right-8 bottom-8 border border-primary/20 rounded-lg pointer-events-none" />
      <div className="hidden md:block absolute top-12 left-12 right-12 bottom-12 border border-primary/10 rounded-lg pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 sm:pt-20 md:pt-0">
        <div className="flex justify-center mb-6 animate-fade-in">
          <Logo className="h-32 sm:h-40 md:h-56 lg:h-64 w-auto" />
        </div>

        <p className="text-muted-foreground text-base md:text-lg font-body tracking-[0.3em] uppercase mb-6 animate-fade-in">
          {settings.tagline}
        </p>

        <h1 className="sr-only">{names[0] || "Albert"} &amp; {names[1] || "Ruby"} — Wedding</h1>

        <div className="flex items-center justify-center gap-4 my-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-primary/50" />
          <Heart className="w-6 h-6 text-primary fill-primary/20" />
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        <p className="font-display text-2xl md:text-3xl text-foreground/80 mb-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Request the pleasure of your company
        </p>
        {settingsLoaded ? (
          <p className="font-display text-3xl md:text-4xl text-primary mb-12 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {dateStr}
          </p>
        ) : (
          <div className="mx-auto h-9 md:h-11 w-64 md:w-80 mb-12 rounded bg-muted/40 animate-pulse" />
        )}

        {/* Countdown OR post-wedding celebration — only render after settings load to avoid flash */}
        {!settingsLoaded ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-8 max-w-xl mx-auto mb-12">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-lg p-3 sm:p-4 md:p-6 shadow-soft animate-pulse h-[60px] sm:h-[72px] md:h-[96px]" />
                <div className="h-3 mt-2 mx-auto w-12 bg-muted/40 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : timeLeft.isPast ? (
          <div className="max-w-xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 md:p-10 shadow-elegant text-center">
              <Heart className="w-12 h-12 text-primary fill-primary/30 mx-auto mb-4 animate-pulse" />
              <p className="font-display text-3xl md:text-4xl text-primary font-semibold mb-2">
                We did it!
              </p>
              <p className="text-muted-foreground font-body text-base md:text-lg">
                Thank you for celebrating with us. Share your memories in the gallery below.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-8 max-w-xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 sm:p-4 md:p-6 shadow-soft">
                  <span className="font-display text-3xl md:text-5xl text-primary font-semibold">
                    {value.toString().padStart(2, "0")}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2 font-body tracking-wider uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-display shadow-elegant">
            <Link to="/rsvp">RSVP Now</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => scrollToSection("schedule")}
            className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-6 text-lg font-display"
          >
            View Details
          </Button>
          <ShareInvite coupleNames={settings.couple_names} dateStr={dateStr} />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-primary/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
