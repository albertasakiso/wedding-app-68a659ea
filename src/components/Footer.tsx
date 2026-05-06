import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { formatWeddingDate } from "@/lib/date-utils";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const dateStr = formatWeddingDate(settings?.wedding_date, "ordinal");
  const year = formatWeddingDate(settings?.wedding_date, "year");
  const couple = settings?.couple_names || "Albert & Ruby";

  return (
    <footer className="py-12 bg-card border-t border-primary/10">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <Logo className="h-16 w-auto" />
            <span className="font-display text-2xl text-foreground">{couple}</span>
          </div>

          <p className="font-display text-lg text-primary mb-6">{dateStr}</p>

          <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
            <Link to="/rsvp" className="font-body text-muted-foreground hover:text-foreground transition-colors">RSVP</Link>
            <button onClick={() => document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" })} className="font-body text-muted-foreground hover:text-foreground transition-colors">Schedule</button>
            <button onClick={() => document.getElementById("venue")?.scrollIntoView({ behavior: "smooth" })} className="font-body text-muted-foreground hover:text-foreground transition-colors">Venue</button>
            <Link to="/gallery" className="font-body text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
            <Link to="/gifts" className="font-body text-muted-foreground hover:text-foreground transition-colors">Gifts</Link>
          </div>

          <p className="text-muted-foreground font-body text-sm max-w-md mx-auto mb-6">
            We can't wait to celebrate this special day with you. Your presence means the world to us.
          </p>

          <p className="text-muted-foreground/60 text-xs font-body">Made with love • © {year}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
