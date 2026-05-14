import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Download, Search, Bell, Loader2, Plus, Pencil, Eraser } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRowSelection } from "@/hooks/useRowSelection";
import BulkSelectionBar from "./BulkSelectionBar";
import RSVPFormDialog from "./RSVPFormDialog";

import type { RSVPRow } from "./types";

interface RSVPsTabProps {
  rsvps: RSVPRow[];
  onRefresh: () => void;
}

export default function RSVPsTab({ rsvps, onRefresh }: RSVPsTabProps) {
  const [search, setSearch] = useState("");
  const [sendingReminders, setSendingReminders] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RSVPRow | null>(null);
  const sel = useRowSelection();
  const { toast } = useToast();

  const filtered = rsvps.filter((r) =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.email || "").toLowerCase().includes(search.toLowerCase())
  );
  const visibleIds = filtered.map((r) => r.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => sel.has(id));

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete RSVP from ${name}? This removes their entire response.`)) return;
    try {
      await adminApi("delete-rsvp", { id });
      toast({ title: "RSVP deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleClearMessage = async (id: string, name: string) => {
    if (!confirm(`Remove the message from ${name}'s RSVP? Their attendance will be kept.`)) return;
    try {
      await adminApi("clear-rsvp-message", { id });
      toast({ title: "Message removed" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${sel.count} RSVPs? This cannot be undone.`)) return;
    try {
      await adminApi("bulk-delete-rsvp", { ids: sel.ids });
      toast({ title: `${sel.count} RSVPs deleted` });
      sel.clear();
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleBulkClearMessages = async () => {
    if (!confirm(`Remove messages from ${sel.count} RSVPs? Their attendance will be kept.`)) return;
    try {
      await adminApi("bulk-clear-rsvp-messages", { ids: sel.ids });
      toast({ title: `Cleared messages from ${sel.count} RSVPs` });
      sel.clear();
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSendReminders = async () => {
    const guestsWithEmail = rsvps.filter((r) => r.attending && r.email);
    if (guestsWithEmail.length === 0) {
      return toast({ title: "No guests with email", description: "No attending guests have provided an email address.", variant: "destructive" });
    }
    if (!confirm(`Send reminder emails to ${guestsWithEmail.length} attending guests with email addresses?`)) return;

    setSendingReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke("email-notifications", {
        body: {
          action: "send-rsvp-reminder",
          guests: guestsWithEmail.map((g) => ({
            guest_name: g.guest_name,
            guest_email: g.email,
          })),
        },
      });
      if (error) throw error;
      toast({ title: "Reminders sent!", description: `${data?.sent_count || guestsWithEmail.length} reminder emails queued.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send reminders", variant: "destructive" });
    } finally {
      setSendingReminders(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Attending", "Plus One", "Message", "Date"];
    const rows = rsvps.map((r) => [
      r.guest_name, r.email || "", r.phone || "", r.attending ? "Yes" : "No",
      r.plus_one_name || "",
      r.message || "", new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvps.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-primary/20"
          />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add RSVP
        </Button>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
        <Button
          onClick={handleSendReminders}
          disabled={sendingReminders}
          className="gap-2 bg-primary text-primary-foreground"
        >
          {sendingReminders ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          Send Reminders
        </Button>
      </div>

      <BulkSelectionBar count={sel.count} onClear={sel.clear}>
        <Button size="sm" variant="outline" onClick={handleBulkClearMessages} className="gap-1">
          <Eraser className="h-3.5 w-3.5" /> Clear messages
        </Button>
        <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="gap-1">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </BulkSelectionBar>

      <div className="rounded-lg border border-primary/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => sel.toggleAll(visibleIds)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plus One</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No RSVPs found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} data-state={sel.has(r.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={sel.has(r.id)} onCheckedChange={() => sel.toggle(r.id)} aria-label={`Select ${r.guest_name}`} />
                  </TableCell>
                  <TableCell className="font-medium">{r.guest_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.attending ? "default" : "destructive"}>
                      {r.attending ? "Attending" : "Declined"}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.plus_one_name || "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.message || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditing(r); setFormOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {r.message && (
                        <Button variant="ghost" size="icon" title="Remove message only" onClick={() => handleClearMessage(r.id, r.guest_name)}>
                          <Eraser className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" title="Delete RSVP" onClick={() => handleDelete(r.id, r.guest_name)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RSVPFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={() => { onRefresh(); }}
      />
    </div>
  );
}
