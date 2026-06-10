import { Link } from "react-router-dom";
import { useProgramme } from "@/hooks/useProgramme";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export default function ProgrammePreview() {
  const { data } = useProgramme();
  const items = (data?.orderOfService || []).slice(0, 5);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-cream/40">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-primary mb-2">Wedding Programme</h2>
          <p className="text-muted-foreground">A preview of our order of service</p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm border border-primary/15 rounded-2xl p-6 md:p-8 shadow-soft">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground">Programme details coming soon.</p>
          ) : (
            <ol className="space-y-2">
              {items.map((o, i) => (
                <li key={o.id} className="flex gap-4 items-baseline border-b border-primary/10 last:border-0 pb-2">
                  <span className="font-display text-primary w-7 shrink-0">{(i + 1).toString().padStart(2, "0")}</span>
                  <div className="flex-1">
                    <p className="font-display text-foreground">{o.item}</p>
                    {o.led_by && <p className="text-xs text-muted-foreground">{o.led_by}</p>}
                  </div>
                </li>
              ))}
              {(data?.orderOfService.length || 0) > items.length && (
                <li className="text-center text-sm text-muted-foreground italic pt-2">
                  …and {(data!.orderOfService.length - items.length)} more
                </li>
              )}
            </ol>
          )}
        </div>

        <div className="text-center mt-8">
          <Button asChild size="lg" className="gap-2">
            <Link to="/programme">
              View Full Programme <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
