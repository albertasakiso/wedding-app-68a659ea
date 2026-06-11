import { useRef, useState } from "react";
import { useProgramme } from "@/hooks/useProgramme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Heart, Download, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { formatWeddingDate } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import ProgrammeSkeleton from "@/components/ProgrammeSkeleton";

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
      <Heart className="w-4 h-4 text-primary fill-primary/30" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-3xl md:text-4xl text-primary text-center mb-2">{children}</h2>
  );
}

export default function Programme() {
  const { data, isLoading } = useProgramme();
  const { data: settings } = useSiteSettings();
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import keeps jspdf + html2canvas out of the initial route chunk.
      const { downloadElementAsPdf } = await import("@/lib/programme-pdf");
      await downloadElementAsPdf(printRef.current, "Albert-and-Ruby-Wedding-Programme.pdf");
    } catch (e: any) {
      toast({ title: "Could not generate PDF", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const hasData = !!data && (data.orderOfService.length > 0 || data.hymns.length > 0 || data.functionaries.length > 0 || !!data.thankYou);
  if (isLoading && !hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-cream to-background">
        <ProgrammeSkeleton />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ministers = data.functionaries.filter((f) => f.group_key === "ministers");
  const counsellors = data.functionaries.filter((f) => f.group_key === "counsellors");
  const protocol = data.functionaries.filter((f) => f.group_key === "protocol");
  const photoOrder = data.photography.filter((p) => p.category === "order");
  const photoExclusives = data.photography.filter((p) => p.category === "exclusives");
  const dateStr = formatWeddingDate(settings?.wedding_date, "weekday");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cream to-background">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </Button>
          <h1 className="font-display text-lg md:text-xl text-primary hidden sm:block">Wedding Programme</h1>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
        </div>
      </div>

      <div ref={printRef} className="max-w-5xl mx-auto px-4 sm:px-8 py-10 md:py-16 bg-[#FAF8F3]">
        {/* COVER */}
        <section className="text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-24 md:h-32 w-auto" />
          </div>
          <p className="text-muted-foreground tracking-[0.3em] uppercase text-xs md:text-sm mb-4">Our Wedding</p>
          <div className="font-display text-primary">
            <p className="text-5xl md:text-7xl italic">Albert</p>
            <p className="text-xs tracking-[0.4em] uppercase text-foreground/70 my-2">Asakiso Apiligu</p>
            <p className="text-3xl md:text-4xl text-primary/70">&amp;</p>
            <p className="text-xs tracking-[0.4em] uppercase text-foreground/70 my-2">Teye-Doryumu</p>
            <p className="text-5xl md:text-7xl italic">Ruby</p>
          </div>
          <GoldDivider />
          <p className="font-display text-2xl md:text-3xl text-foreground">{dateStr}</p>
          <p className="font-body text-muted-foreground mt-2">Church of Pentecost · Mpoasei Central, Dansoman</p>
          {data.thankYou?.verse_reference && (
            <p className="mt-6 font-display text-primary italic text-lg">{data.thankYou.verse_reference}</p>
          )}
          {data.thankYou?.verse_text && (
            <p className="font-body text-foreground/80 italic max-w-xl mx-auto">“{data.thankYou.verse_text}”</p>
          )}
        </section>

        {/* ORDER OF SERVICE */}
        {data.orderOfService.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Order of Service</SectionTitle>
            <GoldDivider />
            <ol className="max-w-2xl mx-auto space-y-3">
              {data.orderOfService.map((o, i) => (
                <li key={o.id} className="flex gap-4 items-baseline border-b border-primary/10 pb-2">
                  <span className="font-display text-primary w-8 shrink-0">{(i + 1).toString().padStart(2, "0")}</span>
                  <div className="flex-1">
                    <p className="font-display text-lg text-foreground">{o.item}</p>
                    {o.led_by && <p className="text-sm text-muted-foreground">{o.led_by}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* FUNCTIONARIES */}
        {data.functionaries.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Functionaries</SectionTitle>
            <GoldDivider />
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {ministers.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-primary text-center mb-3">Officiating Ministers</h3>
                  <ul className="space-y-3 text-center">
                    {ministers.map((m) => (
                      <li key={m.id}>
                        <p className="font-semibold text-foreground">{m.name}</p>
                        {m.affiliation && <p className="text-xs italic text-muted-foreground">{m.affiliation}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {counsellors.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-primary text-center mb-3">Counsellors</h3>
                  <ul className="space-y-1.5 text-center">
                    {counsellors.map((c) => <li key={c.id} className="text-foreground">{c.name}</li>)}
                  </ul>
                </div>
              )}
              {protocol.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-primary text-center mb-3">Protocol</h3>
                  <ul className="space-y-1.5 text-center">
                    {protocol.map((p) => <li key={p.id} className="text-foreground">{p.name}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* HYMNS */}
        {data.hymns.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Hymns</SectionTitle>
            <GoldDivider />
            <div className="space-y-10 max-w-3xl mx-auto">
              {data.hymns.map((h) => (
                <div key={h.id} className="text-center">
                  <h3 className="font-display text-2xl text-primary">{h.title}</h3>
                  {h.reference && <p className="text-sm text-muted-foreground">{h.reference}</p>}
                  {h.author && <p className="text-xs italic text-muted-foreground">— {h.author}</p>}
                  {h.lyrics && (
                    <pre className="mt-4 font-body text-foreground/90 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{h.lyrics}</pre>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PHOTOGRAPHY */}
        {photoOrder.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Order of Photography</SectionTitle>
            <GoldDivider />
            <ul className="max-w-xl mx-auto grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {photoOrder.map((p) => (
                <li key={p.id} className="flex gap-2 items-baseline">
                  <span className="text-primary">●</span>
                  <span className="text-foreground">{p.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* EXCLUSIVES */}
        {photoExclusives.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Exclusives</SectionTitle>
            <GoldDivider />
            <ul className="max-w-xl mx-auto grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {photoExclusives.map((p) => (
                <li key={p.id} className="flex gap-2 items-baseline">
                  <span className="text-primary">●</span>
                  <span className="text-foreground">{p.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CREDITS */}
        {data.credits.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Credits</SectionTitle>
            <GoldDivider />
            <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {data.credits.map((c) => (
                <div key={c.id} className="border-b border-primary/10 pb-2">
                  <p className="text-xs uppercase tracking-wider text-primary">{c.role}</p>
                  <p className="font-display text-foreground">{c.name}</p>
                  {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* THANK YOU */}
        {data.thankYou?.body && (
          <section className="mt-16">
            <SectionTitle>Thank You</SectionTitle>
            <GoldDivider />
            <div className="max-w-2xl mx-auto text-center font-body text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {data.thankYou.body}
            </div>
            <div className="text-center mt-8">
              <Heart className="w-6 h-6 text-primary fill-primary/30 mx-auto" />
              <p className="mt-2 font-display text-2xl text-primary">Albert &amp; Ruby</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
