import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import type { AuditLogRow } from "./types";

function diffKeys(before: any, after: any): string[] {
  if (!before || !after) return [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Array.from(keys).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]) && !["updated_at","last_modified_by_user_id"].includes(k));
}

export default function GiftAuditLogTab() {
  const [entries, setEntries] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi("list-audit-log").then((r) => setEntries(r.entries || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const ActionIcon = (a: string) => a === "create" ? Plus : a === "delete" ? Trash2 : Pencil;
  const actionColor = (a: string) => a === "create" ? "text-green-600" : a === "delete" ? "text-destructive" : "text-amber-600";

  if (loading) return <p className="text-muted-foreground text-center py-8">Loading audit log…</p>;
  if (entries.length === 0) return <p className="text-muted-foreground text-center py-8">No audit entries yet.</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Every gift create / edit / delete is permanently recorded here. This log cannot be deleted.</p>
      {entries.map((e) => {
        const Icon = ActionIcon(e.action);
        const changed = e.action === "update" ? diffKeys(e.before, e.after) : [];
        const snapshot = e.action === "delete" ? e.before : e.after;
        return (
          <Card key={e.id} className="border-primary/10">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${actionColor(e.action)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium capitalize">{e.action}</span>
                    <Badge variant="outline" className="text-xs">{e.actor_role || "?"}</Badge>
                    <span className="text-sm text-muted-foreground">by {e.actor_name || "unknown"}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                      <Clock className="h-3 w-3" />{new Date(e.created_at).toLocaleString()}
                    </span>
                  </div>
                  {snapshot?.donor_name && (
                    <div className="text-sm mt-1">
                      <span className="text-muted-foreground">Gift from </span>
                      <span className="font-medium">{snapshot.donor_name}</span>
                      {snapshot.amount && <span className="text-primary"> · GH₵{Number(snapshot.amount).toLocaleString()}</span>}
                      {snapshot.gift_type && <span className="text-muted-foreground"> · {snapshot.gift_type}</span>}
                    </div>
                  )}
                  {e.reason && (
                    <div className="text-sm mt-1 italic text-foreground/80">"{e.reason}"</div>
                  )}
                  {changed.length > 0 && (
                    <div className="mt-2 grid gap-1">
                      {changed.map((k) => (
                        <div key={k} className="text-xs bg-muted/40 rounded px-2 py-1 font-mono">
                          <span className="text-muted-foreground">{k}: </span>
                          <span className="text-destructive line-through">{JSON.stringify(e.before?.[k]) ?? "—"}</span>
                          {" → "}
                          <span className="text-green-700">{JSON.stringify(e.after?.[k]) ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
