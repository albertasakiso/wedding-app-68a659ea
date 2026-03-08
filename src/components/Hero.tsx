import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const WEDDING_DATE = new Date("2026-05-02T15:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Hero = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = WEDDING_DATE.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-cream to-background">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-champagne/30 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-blush/20 blur-2xl animate-float" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Ornamental borders */}
      <div className="absolute top-8 left-8 right-8 bottom-8 border border-primary/20 rounded-lg pointer-events-none" />
      <div className="absolute top-12 left-12 right-12 bottom-12 border border-primary/10 rounded-lg pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Pre-title */}
        <p className="text-muted-foreground text-lg md:text-xl font-body tracking-[0.3em] uppercase mb-6 animate-fade-in">
          Together with their families
        </p>

        {/* Names */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-foreground mb-4 animate-slide-up">
          <span className="text-primary">Albert</span>
          <span className="mx-4 text-primary/60">&</span>
          <span className="text-primary">Ruby</span>
        </h1>

        {/* Heart divider */}
        <div className="flex items-center justify-center gap-4 my-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-primary/50" />
          <Heart className="w-6 h-6 text-primary fill-primary/20" />
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        {/* Date announcement */}
        <p className="font-display text-2xl md:text-3xl text-foreground/80 mb-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Request the pleasure of your company
        </p>
        <p className="font-display text-3xl md:text-4xl text-primary mb-12 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          May 2nd, 2026
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Minutes" },
            { value: timeLeft.seconds, label: "Seconds" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 md:p-6 shadow-soft">
                <span className="font-display text-3xl md:text-5xl text-primary font-semibold">
                  {value.toString().padStart(2, "0")}
                </span>
              </div>
              <p className="text-muted-foreground text-sm md:text-base mt-2 font-body tracking-wider uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
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
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-primary/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
