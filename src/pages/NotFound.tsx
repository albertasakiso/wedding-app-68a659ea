import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-cream/40 to-background px-4">
      <div className="text-center max-w-md">
        <div className="relative mx-auto mb-8 w-24 h-24">
          <Heart className="w-24 h-24 text-primary/20 fill-primary/10 absolute inset-0" />
          <Heart className="w-24 h-24 text-primary fill-primary/30 absolute inset-0 animate-pulse" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }} />
        </div>
        <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">404 · Lost in love</p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground font-body text-lg mb-8">
          Looks like this page wandered off to celebrate without us. Let's get you back home.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
