import { useEffect, useState } from "react";
import { Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface DressCodeData {
  dress_code: string | null;
  dress_code_colors: string[] | null;
}

export default function DressCode() {
  const [data, setData] = useState<DressCodeData | null>(null);
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("dress_code, dress_code_colors")
      .limit(1)
      .single()
      .then(({ data }) => setData(data as DressCodeData | null));
  }, []);

  if (!data?.dress_code) return null;

  const colors = data.dress_code_colors || [];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-cream/30">
      <div
        ref={ref}
        className={`container mx-auto px-4 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-2xl mx-auto text-center">
          <Shirt className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Dress Code</h2>
          <p className="text-muted-foreground font-body text-lg mb-8 leading-relaxed">
            {data.dress_code}
          </p>
          {colors.length > 0 && (
            <div className="flex justify-center items-center gap-3 flex-wrap">
              {colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full border-2 border-primary/20 shadow-soft"
                    style={{ backgroundColor: color }}
                    aria-label={`Dress code color ${color}`}
                  />
                  <span className="text-xs font-mono text-muted-foreground">{color}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
