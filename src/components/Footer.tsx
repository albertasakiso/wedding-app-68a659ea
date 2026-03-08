import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-primary/10">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-primary fill-primary/20" />
            <span className="font-display text-2xl text-foreground">Albert & Ruby</span>
          </div>

          {/* Date */}
          <p className="font-display text-lg text-primary mb-6">May 2nd, 2026</p>

          {/* Quick Links */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <Link to="/rsvp" className="font-body text-muted-foreground hover:text-foreground transition-colors">
              RSVP
            </Link>
            <button
              onClick={() => document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" })}
              className="font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              Schedule
            </button>
            <button
              onClick={() => document.getElementById("venue")?.scrollIntoView({ behavior: "smooth" })}
              className="font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              Venue
            </button>
            <Link to="/gallery" className="font-body text-muted-foreground hover:text-foreground transition-colors">
              Gallery
            </Link>
          </div>

          {/* Message */}
          <p className="text-muted-foreground font-body text-sm max-w-md mx-auto mb-6">
            We can't wait to celebrate this special day with you. Your presence means the world to us.
          </p>

          {/* Copyright */}
          <p className="text-muted-foreground/60 text-xs font-body">
            Made with love • © 2026
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
