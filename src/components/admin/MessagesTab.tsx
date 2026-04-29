import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search } from "lucide-react";
import { useState } from "react";
import type { RSVPRow } from "./types";

interface MessagesTabProps {
  rsvps: RSVPRow[];
}

export default function MessagesTab({ rsvps }: MessagesTabProps) {
  const [search, setSearch] = useState("");
  const withMessages = rsvps
    .filter((r) => r.message)
    .filter(
      (r) =>
        !search ||
        r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
        (r.message || "").toLowerCase().includes(search.toLowerCase())
    );

  const waLink = (phone: string | null) =>
    phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages or names…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-primary/20"
        />
      </div>

      {withMessages.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No messages from guests yet.</p>
      ) : (
        withMessages.map((r) => {
          const wa = waLink(r.phone);
          return (
            <Card key={r.id} className="border-primary/10">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-semibold text-foreground">{r.guest_name}</p>
                      {wa && (
                        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                          <a href={wa} target="_blank" rel="noopener noreferrer">Reply on WhatsApp</a>
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{r.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
