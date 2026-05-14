import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Download, Search, Plus, Mail } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { useRowSelection } from "@/hooks/useRowSelection";
import BulkSelectionBar from "./BulkSelectionBar";

interface EmailListTabProps {
  subscribers: any[];
  onRefresh: () => void;
}

export default function EmailListTab({ subscribers, onRefresh }: EmailListTabProps) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", email: "", phone: "" });
  const sel = useRowSelection();
  const { toast } = useToast();

  const filtered = subscribers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  const visibleIds = filtered.map((s: any) => s.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => sel.has(id));

  const handleBulkDelete = async () => {
    if (!confirm(`Remove ${sel.count} subscribers from the email list?`)) return;
    try {
      await adminApi("bulk-delete-subscriber", { ids: sel.ids });
      toast({ title: `${sel.count} subscribers removed` });
      sel.clear();
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the email list?`)) return;
    try {
      await adminApi("delete-subscriber", { id });
      toast({ title: "Subscriber removed" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAdd = async () => {
    if (!newSub.name.trim() || !newSub.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    try {
      await adminApi("add-subscriber", {
        name: newSub.name.trim(),
        email: newSub.email.trim(),
        phone: newSub.phone.trim() || null,
        source: "manual",
      });
      toast({ title: "Subscriber added" });
      setNewSub({ name: "", email: "", phone: "" });
      setShowAdd(false);
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Subscribed", "Date"];
    const rows = subscribers.map((s) => [
      s.name, s.email, s.phone || "", s.source || "rsvp",
      s.subscribed ? "Yes" : "No", new Date(s.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: string) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-list.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-body text-muted-foreground">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-primary">{subscribers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-body text-muted-foreground">From RSVPs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-primary">
              {subscribers.filter((s) => s.source === "rsvp").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-primary/20"
          />
        </div>
        <Button variant="outline" onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" /> Add
        </Button>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="border-primary/10">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Name" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} className="border-primary/20" />
              <Input placeholder="Email" type="email" value={newSub.email} onChange={(e) => setNewSub({ ...newSub, email: e.target.value })} className="border-primary/20" />
              <Input placeholder="Phone (optional)" type="tel" value={newSub.phone} onChange={(e) => setNewSub({ ...newSub, phone: e.target.value })} className="border-primary/20" />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Mail className="h-4 w-4" /> Add Subscriber
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-lg border border-primary/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No subscribers yet
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="text-muted-foreground">{s.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={s.source === "rsvp" ? "default" : "secondary"}>
                      {s.source || "rsvp"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
