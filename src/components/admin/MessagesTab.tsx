import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Search, Eraser } from "lucide-react";
import { useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { useRowSelection } from "@/hooks/useRowSelection";
import BulkSelectionBar from "./BulkSelectionBar";
import type { RSVPRow } from "./types";

interface MessagesTabProps {
  rsvps: RSVPRow[];
  onRefresh?: () => void;
}

export default function MessagesTab({ rsvps, onRefresh }: MessagesTabProps) {
  const [search, setSearch] = useState("");
  const sel = useRowSelection();
  const { toast } = useToast();

  const withMessages = rsvps
    .filter((r) => r.message)
    .filter(
      (r) =>
        !search ||
        r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
        (r.message || "").toLowerCase().includes(search.toLowerCase())
    );

  const visibleIds = withMessages.map((r) => r.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => sel.has(id));

  const handleClear = async (id: string, name: string) => {
    if (!confirm(`Remove message from ${name}? Their RSVP will be kept.`)) return;
    try {
      await adminApi("clear-rsvp-message", { id });
      toast({ title: "Message removed" });
      onRefresh?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleBulkClear = async () => {
    if (!confirm(`Remove messages from ${sel.count} guests? RSVPs will be kept.`)) return;
    try {
      await adminApi("bulk-clear-rsvp-messages", { ids: sel.ids });
      toast({ title: `Cleared ${sel.count} messages` });
      sel.clear();
      onRefresh?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const waLink = (phone: string | null) =>
    phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages or names…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-primary/20"
          />
        </div>
        {visibleIds.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={allSelected} onCheckedChange={() => sel.toggleAll(visibleIds)} />
            Select all
          </label>
        )}
      </div>

      <BulkSelectionBar count={sel.count} onClear={sel.clear}>
        <Button size="sm" variant="destructive" onClick={handleBulkClear} className="gap-1">
          <Eraser className="h-3.5 w-3.5" /> Clear messages
        </Button>
      </BulkSelectionBar>

      {withMessages.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No messages from guests yet.</p>
      ) : (
        withMessages.map((r) => {
          const wa = waLink(r.phone);
          return (
            <Card key={r.id} className="border-primary/10">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={sel.has(r.id)}
                    onCheckedChange={() => sel.toggle(r.id)}
                    className="mt-1"
                    aria-label={`Select ${r.guest_name}`}
                  />
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-semibold text-foreground">{r.guest_name}</p>
                      <div className="flex items-center gap-2">
                        {wa && (
                          <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                            <a href={wa} target="_blank" rel="noopener noreferrer">Reply on WhatsApp</a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-amber-700 hover:text-amber-700"
                          onClick={() => handleClear(r.id, r.guest_name)}
                        >
                          <Eraser className="h-3.5 w-3.5" /> Remove message
                        </Button>
                      </div>
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
