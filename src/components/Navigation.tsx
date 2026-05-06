import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  type NavItem = { label: string; href?: string; action?: () => void; highlight?: boolean };
  const navItems: NavItem[] = [
    { label: "Home", action: () => scrollToSection("hero") },
    { label: "Schedule", action: () => scrollToSection("schedule") },
    { label: "Venue", action: () => scrollToSection("venue") },
    { label: "Gallery", href: "/gallery" },
    { label: "Gifts", href: "/gifts" },
    { label: "My Day", href: "/my-day" },
    { label: "RSVP", href: "/rsvp", highlight: true },
  ];

  const isActive = (href?: string) => href && location.pathname === href;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-soft py-2" : "bg-background/40 backdrop-blur-sm py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label="Home">
          <Logo className="h-9 md:h-10 w-auto" />
          <span className="hidden sm:inline font-display text-lg md:text-xl text-foreground">A &amp; R</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "font-body text-sm lg:text-base tracking-wide transition-colors font-semibold",
                  item.highlight
                    ? "text-primary hover:text-primary/80"
                    : isActive(item.href)
                      ? "text-foreground"
                      : "text-foreground/70 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className="font-body text-sm lg:text-base tracking-wide text-foreground/70 hover:text-foreground transition-colors font-semibold"
              >
                {item.label}
              </button>
            )
          )}
        </div>

        {/* Mobile menu via Sheet — reliable on iOS Safari */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 sm:w-80 flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-display text-primary">
                <Logo className="h-8 w-auto" />
                Albert &amp; Ruby
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              {navItems.map((item, i) =>
                item.href ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "font-body text-base py-3 px-3 rounded-md transition-colors border-b border-border/40 last:border-0",
                      item.highlight
                        ? "text-primary font-bold bg-primary/5"
                        : isActive(item.href)
                          ? "text-foreground font-semibold bg-muted/50"
                          : "text-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="font-body text-base py-3 px-3 rounded-md text-foreground/80 hover:bg-muted/30 text-left transition-colors border-b border-border/40 last:border-0"
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navigation;
