import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { label: "Home", action: () => scrollToSection("hero") },
    { label: "Schedule", action: () => scrollToSection("schedule") },
    { label: "Venue", action: () => scrollToSection("venue") },
    { label: "Gallery", href: "/gallery" },
    { label: "Gifts", href: "/gifts" },
    { label: "RSVP", href: "/rsvp", highlight: true },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-soft py-3" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-primary fill-primary/20 group-hover:fill-primary/40 transition-colors" />
          <span className="font-display text-xl text-foreground">A & R</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "font-body text-base tracking-wide transition-colors font-bold",
                  item.highlight
                    ? "text-primary hover:text-primary/80"
                    : "text-foreground/80 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className="font-body text-base tracking-wide text-foreground/70 hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            )
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-md border-b border-border shadow-elegant">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navItems.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "font-body text-lg py-2 transition-colors",
                    item.highlight ? "text-primary font-semibold" : "text-foreground/70"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="font-body text-lg py-2 text-foreground/70 text-left"
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
