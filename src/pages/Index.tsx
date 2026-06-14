import { useState } from "react";
import { Heart, Smartphone, Building2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { formatWeddingDate } from "@/lib/date-utils";

const Index = () => {
  const { data: settings } = useSiteSettings();
  const couple = settings?.couple_names || "Albert & Ruby";
  const dateStr = formatWeddingDate(settings?.wedding_date, "ordinal");
  const year = formatWeddingDate(settings?.wedding_date, "year");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cream to-background">
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-2xl">
        {/* Thank You */}
        <section className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <Logo className="h-28 md:h-36 w-auto" />
          </div>

          <p className="text-muted-foreground text-sm md:text-base font-body tracking-[0.3em] uppercase mb-4">
            {couple}
          </p>

          <div className="flex items-center justify-center gap-4 my-6">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-primary/50" />
            <Heart className="w-6 h-6 text-primary fill-primary/20" />
            <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-primary font-semibold mb-6">
            Thank You
          </h1>

          <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed max-w-xl mx-auto mb-3">
            From the bottom of our hearts, thank you for celebrating our wedding with us
            {dateStr ? ` on ${dateStr}` : ""}. Your love, prayers, and presence made our day truly unforgettable.
          </p>
          <p className="font-display italic text-lg md:text-xl text-primary mt-6">
            With all our love, {couple}
          </p>
        </section>

        {/* Support the Couple */}
        <section className="mt-16 md:mt-20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">Support the Couple</h2>
            <p className="text-muted-foreground font-body text-sm md:text-base max-w-md mx-auto">
              If you would still like to bless us, here are the details. Every gift is received with gratitude.
            </p>
          </div>

          <div className="space-y-4">
            {/* MTN MoMo */}
            <div className="rounded-xl p-6 bg-card border border-primary/10 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-yellow-600" />
                <span className="font-body font-semibold text-foreground">MTN Mobile Money</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-sans text-xl md:text-2xl font-bold tracking-wider transition-colors ${copied === "mtn" ? "text-primary" : "text-foreground"}`}>
                  024 6904618
                </span>
                <Button variant="ghost" size="sm" onClick={() => copy("0246904618", "mtn")} className="h-8 px-2">
                  {copied === "mtn" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-2">Asakiso Apiligu</p>
            </div>

            {/* Telecel */}
            <div className="rounded-xl p-6 bg-card border border-primary/10 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-red-600" />
                <span className="font-body font-semibold text-foreground">Telecel Cash</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-sans text-xl md:text-2xl font-bold tracking-wider transition-colors ${copied === "telecel" ? "text-primary" : "text-foreground"}`}>
                  020 4532502
                </span>
                <Button variant="ghost" size="sm" onClick={() => copy("0204532502", "telecel")} className="h-8 px-2">
                  {copied === "telecel" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-2">Asakiso Apiligu</p>
            </div>

            {/* Bank */}
            <div className="rounded-xl p-6 bg-card border border-primary/10 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-body font-semibold text-foreground">Bank Transfer</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Account Name</span>
                  <span className="font-sans text-base md:text-lg font-bold text-foreground">Asakiso Apiligu</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground font-body">Account No.</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-sans text-base md:text-xl font-bold tracking-wider transition-colors ${copied === "acct" ? "text-primary" : "text-foreground"}`}>
                      8011010337930
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => copy("8011010337930", "acct")} className="h-6 px-1">
                      {copied === "acct" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Bank</span>
                  <span className="font-sans text-base md:text-lg font-bold text-foreground">GCB Bank PLC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Swift Code</span>
                  <span className="font-sans text-base md:text-lg font-bold text-foreground tracking-wider">GHCBGHAC</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-primary/10">
          <p className="font-display text-lg text-primary mb-1">{couple}</p>
          {dateStr && <p className="text-muted-foreground font-body text-sm mb-3">{dateStr}</p>}
          <p className="text-muted-foreground/60 text-xs font-body">Made with love • © {year || new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
