import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { StoryMilestone } from "@/components/admin/types";

function MilestoneCard({ m, index }: { m: StoryMilestone; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-6 mb-12 last:mb-0 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-soft z-10">
        <Heart className="w-5 h-5 text-primary fill-primary/20" />
      </div>

      <div className={`ml-28 md:ml-0 md:w-1/2 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
        <div className="bg-card/80 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-soft hover:shadow-elegant transition-shadow">
          <p className="text-primary font-display text-lg font-semibold mb-1">{m.year}</p>
          <h3 className="font-display text-2xl text-foreground mb-2">{m.title}</h3>
          <p className="text-muted-foreground font-body">{m.description}</p>
          {m.image_url && (
            <img
              src={m.image_url}
              alt={m.title}
              loading="lazy"
              className="mt-4 rounded-lg w-full aspect-square object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorySection() {
  const [milestones, setMilestones] = useState<StoryMilestone[]>([]);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("story_milestones")
      .limit(1)
      .single()
      .then(({ data }) => {
        const raw = (data?.story_milestones as unknown) as StoryMilestone[] | null;
        if (Array.isArray(raw)) setMilestones(raw);
      });
  }, []);

  if (milestones.length === 0) return null;

  return (
    <section id="story" className="py-24 bg-gradient-to-b from-background via-cream/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">Our Journey</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Our <span className="text-primary">Story</span>
          </h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          {milestones.map((m, i) => (
            <MilestoneCard key={i} m={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
