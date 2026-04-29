import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, UserCheck, UserX, Gift, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ActivityItem = {
  id: string;
  type: "rsvp" | "gift" | "photo";
  label: string;
  detail: string;
  created_at: string;
  positive?: boolean;
};

export default function RecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rsvpRes, giftRes, photoRes] = await Promise.all([
          supabase.from("rsvps").select("id, guest_name, attending, created_at").order("created_at", { ascending: false }).limit(10),
          supabase.from("gift_wall").select("id, donor_name, gift_type, created_at").order("created_at", { ascending: false }).limit(10),
          supabase.from("gallery_photos").select("id, uploaded_by, created_at").order("created_at", { ascending: false }).limit(10),
        ]);

        const merged: ActivityItem[] = [
          ...(rsvpRes.data || []).map((r) => ({
            id: `rsvp-${r.id}`,
            type: "rsvp" as const,
            label: r.guest_name,
            detail: r.attending ? "RSVP'd attending" : "Sent regrets",
            created_at: r.created_at,
            positive: !!r.attending,
          })),
          ...(giftRes.data || []).map((g) => ({
            id: `gift-${g.id}`,
            type: "gift" as const,
            label: g.donor_name,
            detail: `Gift via ${g.gift_type}`,
            created_at: g.created_at,
          })),
          ...(photoRes.data || []).map((p) => ({
            id: `photo-${p.id}`,
            type: "photo" as const,
            label: p.uploaded_by || "Guest",
            detail: "Uploaded a photo",
            created_at: p.created_at,
          })),
        ]
          .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
          .slice(0, 10);

        setItems(merged);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const iconFor = (item: ActivityItem) => {
    if (item.type === "rsvp") return item.positive ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-500" />;
    if (item.type === "gift") return <Gift className="h-4 w-4 text-primary" />;
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
  };

  const relative = (iso: string) => {
    const d = (Date.now() - +new Date(iso)) / 1000;
    if (d < 60) return "just now";
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <div className="shrink-0">{iconFor(it)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{it.label}</p>
                  <p className="text-xs text-muted-foreground">{it.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground/70 shrink-0">{relative(it.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
