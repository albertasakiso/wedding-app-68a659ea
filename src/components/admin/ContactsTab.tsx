import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Users, Heart, Gift, MessageSquare } from "lucide-react";
import { toCsv, downloadCsv } from "@/lib/csv-utils";

interface Contact {
  name: string;
  phone: string | null;
  email: string | null;
  rsvpd?: boolean;
  attending?: boolean;
  checked_in?: boolean;
  gave_gift?: boolean;
  gift_total?: number;
  gift_summary?: string;
  messaged?: boolean;
  last_seen?: string;
  sources: string[];
}

export default function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    adminApi("list-contacts").then((r) => setContacts(r.contacts || []))
      .catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => contacts.filter((c) => {
    if (filter === "attended" && !c.checked_in) return false;
    if (filter === "rsvp" && !c.rsvpd) return false;
    if (filter === "gifters" && !c.gave_gift) return false;
    if (filter === "messaged" && !c.messaged) return false;
    if (search) {
      const t = `${c.name} ${c.phone ?? ""} ${c.email ?? ""}`.toLowerCase();
      if (!t.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [contacts, filter, search]);

  const stats = {
    total: contacts.length,
    attended: contacts.filter((c) => c.checked_in).length,
    gifters: contacts.filter((c) => c.gave_gift).length,
    messaged: contacts.filter((c) => c.messaged).length,
  };

  const exportFiltered = () => {
    const csv = toCsv(filtered.map((c) => ({ ...c, sources: c.sources.join("|") })) as any, [
      { key: "name", header: "Name" },
      { key: "phone", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "rsvpd", header: "RSVP'd" },
      { key: "attending", header: "Attending" },
      { key: "checked_in", header: "Checked In" },
      { key: "gave_gift", header: "Gave Gift" },
      { key: "gift_total", header: "Gift Total" },
      { key: "gift_summary", header: "Gift Summary" },
      { key: "messaged", header: "Sent Message" },
      { key: "sources", header: "Sources" },
    ]);
    downloadCsv(`contacts-${filter}-${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">Loading contacts…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground"><Users className="inline h-3 w-3" /> All Contacts</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground"><Heart className="inline h-3 w-3" /> Attended</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-primary">{stats.attended}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground"><Gift className="inline h-3 w-3" /> Gifters</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-primary">{stats.gifters}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground"><MessageSquare className="inline h-3 w-3" /> Messaged</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{stats.messaged}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <Input placeholder="Search name / phone / email…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contacts</SelectItem>
              <SelectItem value="attended">Attended (for photos)</SelectItem>
              <SelectItem value="gifters">Gave a gift (for thank-you)</SelectItem>
              <SelectItem value="rsvp">RSVP'd</SelectItem>
              <SelectItem value="messaged">Sent a message</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportFiltered} className="gap-2"><Download className="h-3 w-3" /> Export {filtered.length}</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead>
            <TableHead>Sources</TableHead><TableHead>Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.slice(0, 500).map((c, i) => (
            <TableRow key={`${c.phone || c.email || c.name}-${i}`}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-sm">{c.phone || "—"}</TableCell>
              <TableCell className="text-sm">{c.email || "—"}</TableCell>
              <TableCell><div className="flex gap-1 flex-wrap">{c.sources.map((s) => <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-muted">{s}</span>)}</div></TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {c.checked_in && <span className="text-primary">✓ Attended </span>}
                {c.gave_gift && <span>🎁 {c.gift_summary?.slice(0, 40)} </span>}
                {c.messaged && <span>💬 </span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filtered.length > 500 && <p className="text-xs text-muted-foreground text-center">Showing first 500. Export to see all.</p>}
    </div>
  );
}
