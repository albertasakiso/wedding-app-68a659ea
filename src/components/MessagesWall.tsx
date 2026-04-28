import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { anonymizeEntry } from "@/lib/format-utils";
import { MessageCircle } from "lucide-react";

interface RSVPMessage {
  id: string;
  guest_name: string;
  phone: string | null;
  message: string;
  created_at: string;
}

function MessagesColumn({
  messages,
  duration = 20,
  className = "",
}: {
  messages: RSVPMessage[];
  duration?: number;
  className?: string;
}) {
  const [paused, setPaused] = useState(false);

  if (messages.length === 0) return null;

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={{ willChange: "transform", animationPlayState: paused ? "paused" : "running" }}
        className="flex flex-col gap-6 pb-6"
      >
        {[0, 1].map((_, index) => (
          <motion.div
            key={index}
            className="flex flex-col gap-6"
            animate={paused ? { y: 0 } : undefined}
          >
            {messages.map((msg) => (
              <div
                key={`${index}-${msg.id}`}
                className="p-6 rounded-2xl border border-primary/10 bg-card shadow-sm max-w-xs w-full"
              >
                <p className="text-foreground font-body text-sm leading-relaxed">
                  "{msg.message}"
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold font-sans">
                      {msg.guest_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-xs font-medium text-foreground tracking-tight">
                      {anonymizeEntry(msg.guest_name, msg.phone)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Guest</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function MessagesWall() {
  const [messages, setMessages] = useState<RSVPMessage[]>([]);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("rsvps")
      .select("id, guest_name, phone, message, created_at")
      .not("message", "is", null)
      .neq("message", "")
      .order("created_at", { ascending: false })
      .limit(30);
    setMessages((data || []) as RSVPMessage[]);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useRealtimeTable("rsvps", fetchMessages, "messages-wall-realtime");

  if (messages.length === 0) return null;

  const col1 = messages.filter((_, i) => i % 3 === 0);
  const col2 = messages.filter((_, i) => i % 3 === 1);
  const col3 = messages.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            Well Wishes
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Heartfelt messages from our beloved guests
          </p>
        </div>

        <div className="flex justify-center gap-6 max-h-[500px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
          <MessagesColumn messages={col1} duration={25} className="hidden md:block" />
          <MessagesColumn messages={col2} duration={18} />
          {col3.length > 0 && (
            <MessagesColumn messages={col3} duration={22} className="hidden lg:block" />
          )}
        </div>
      </div>
    </section>
  );
}
