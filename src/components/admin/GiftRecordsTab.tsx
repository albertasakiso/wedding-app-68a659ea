import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Eye, EyeOff, Download, CheckCircle2, Filter } from "lucide-react";
import ReasonDialog from "./ReasonDialog";
import { GIFT_TYPES, giftTypeLabel, giftTypeBadgeClass } from "@/lib/gift-types";
import { toCsv, downloadCsv } from "@/lib/csv-utils";
import type { GiftRecordRow } from "./types";

const DONOR_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "family",     label: "Family" },
  { value: "group",      label: "Group / Organization" },
  { value: "anonymous",  label: "Anonymous" },
];

const GIFT_KIND_OPTIONS = [
  { value: "cash",     label: "Cash" },
  { value: "momo",     label: "Mobile Money" },
  { value: "bank",     label: "Bank Transfer" },
  { value: "physical", label: "Physical Gift" },
  { value: "in_kind",  label: "In Kind / Service" },
];

interface Props { canEdit: boolean }

export default function GiftRecordsTab({ canEdit }: Props) {
  const [records, setRecords] = useState<GiftRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GiftRecordRow | null>(null);
  const [reasonOpen, setReasonOpen] = useState<{ kind: "edit" | "delete"; id: string; payload?: any } | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDonorType, setFilterDonorType] = useState<string>("all");
  const [filterThanks, setFilterThanks] = useState<string>("all");
  const [search, setSearch] = useState("");

  const empty = {
    donor_type: "individual",
    donor_name: "",
    donor_phone: "",
    donor_email: "",
    gift_type: "cash" as "cash" | "momo" | "bank" | "physical" | "in_kind",
    amount: "",
    description: "",
    received_by: "",
    notes: "",
    is_visible_on_wall: true,
  };
  const [form, setForm] = useState(empty);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await adminApi("list-gift-records");
      setRecords(res.records || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => records.filter((r) => {
    if (filterType !== "all" && r.gift_type !== filterType) return false;
    if (filterDonorType !== "all" && r.donor_type !== filterDonorType) return false;
    if (filterThanks === "sent" && !r.thank_you_sent) return false;
    if (filterThanks === "pending" && r.thank_you_sent) return false;
    if (search && !`${r.donor_name} ${r.description ?? ""} ${r.donor_phone ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [records, filterType, filterDonorType, filterThanks, search]);

  const totalCash = filtered.filter((r) => ["cash","momo","bank"].includes(r.gift_type))
    .reduce((s, r) => s + Number(r.amount || 0), 0);
  const physicalCount = filtered.filter((r) => ["physical","in_kind"].includes(r.gift_type)).length;

  const resetForm = () => { setForm(empty); setEditing(null); };

  const openEdit = (r: GiftRecordRow) => {
    setEditing(r);
    setForm({
      donor_type: r.donor_type,
      donor_name: r.donor_name,
      donor_phone: r.donor_phone || "",
      donor_email: r.donor_email || "",
      gift_type: r.gift_type,
      amount: r.amount ? String(r.amount) : "",
      description: r.description || "",
      received_by: r.received_by || "",
      notes: r.notes || "",
      is_visible_on_wall: r.is_visible_on_wall,
    });
    setOpen(true);
  };

  const buildPayload = () => ({
    donor_type: form.donor_type,
    donor_name: form.donor_name.trim(),
    donor_phone: form.donor_phone.trim() || null,
    donor_email: form.donor_email.trim() || null,
    gift_type: form.gift_type,
    amount: ["cash","momo","bank"].includes(form.gift_type) && form.amount ? Number(form.amount) : null,
    description: form.description.trim() || null,
    received_by: form.received_by.trim() || null,
    notes: form.notes.trim() || null,
    is_visible_on_wall: form.is_visible_on_wall,
  });

  const submitNew = async () => {
    if (!form.donor_name.trim()) return toast.error("Donor name required");
    try {
      await adminApi("insert-gift-record", buildPayload());
      toast.success("Gift recorded");
      setOpen(false); resetForm(); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const submitEdit = () => {
    if (!editing) return;
    setReasonOpen({ kind: "edit", id: editing.id, payload: buildPayload() });
  };

  const handleVisibilityToggle = (r: GiftRecordRow) => {
    setReasonOpen({ kind: "edit", id: r.id, payload: { is_visible_on_wall: !r.is_visible_on_wall } });
  };

  const handleThankYou = async (r: GiftRecordRow) => {
    try {
      await adminApi("update-gift-record", { id: r.id, thank_you_sent: !r.thank_you_sent, reason: r.thank_you_sent ? "Marked thank-you not yet sent" : "Marked thank-you sent" });
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const exportCsv = () => {
    const csv = toCsv(filtered as any, [
      { key: "received_at", header: "Received" },
      { key: "donor_type", header: "Donor Type" },
      { key: "donor_name", header: "Donor" },
      { key: "donor_phone", header: "Phone" },
      { key: "donor_email", header: "Email" },
      { key: "gift_type", header: "Type" },
      { key: "amount", header: "Amount" },
      { key: "currency", header: "Currency" },
      { key: "description", header: "Description" },
      { key: "received_by", header: "Received by" },
      { key: "thank_you_sent", header: "Thank-You Sent" },
      { key: "notes", header: "Notes" },
    ]);
    downloadCsv(`gifts-${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Records</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cash Collected</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">GH₵{totalCash.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Physical / In-Kind</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{physicalCount}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search donor / phone / item…" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-56" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {GIFT_KIND_OPTIONS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterDonorType} onValueChange={setFilterDonorType}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All donors</SelectItem>
              {DONOR_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterThanks} onValueChange={setFilterThanks}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sent">Thank-you sent</SelectItem>
              <SelectItem value="pending">Thank-you pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2"><Download className="h-3 w-3" /> Export CSV</Button>
          {canEdit && (
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground"><Plus className="h-4 w-4" /> Add Gift Received</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle className="font-display">{editing ? "Edit Gift Record" : "Add Gift Received"}</DialogTitle></DialogHeader>
                <div className="space-y-3 py-2 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Donor Type *</Label>
                      <Select value={form.donor_type} onValueChange={(v) => setForm({ ...form, donor_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DONOR_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Gift Type *</Label>
                      <Select value={form.gift_type} onValueChange={(v) => setForm({ ...form, gift_type: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GIFT_KIND_OPTIONS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Donor Name * {form.donor_type === "family" && <span className="text-muted-foreground text-xs">(e.g. "The Mensah Family")</span>}</Label>
                    <Input value={form.donor_name} onChange={(e) => setForm({ ...form, donor_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Phone</Label><Input value={form.donor_phone} onChange={(e) => setForm({ ...form, donor_phone: e.target.value })} /></div>
                    <div><Label>Email</Label><Input type="email" value={form.donor_email} onChange={(e) => setForm({ ...form, donor_email: e.target.value })} /></div>
                  </div>
                  {["cash","momo","bank"].includes(form.gift_type) && (
                    <div><Label>Amount (GH₵)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                  )}
                  <div>
                    <Label>Description {!["cash","momo","bank"].includes(form.gift_type) && <span className="text-destructive">*</span>}</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={form.gift_type === "physical" ? "e.g. Set of china dinner plates" : form.gift_type === "in_kind" ? "e.g. Photography services" : "Optional note"} />
                  </div>
                  <div>
                    <Label>Received by</Label>
                    <Input value={form.received_by} onChange={(e) => setForm({ ...form, received_by: e.target.value })} placeholder="Who collected it on the day" />
                  </div>
                  <div>
                    <Label>Internal Notes</Label>
                    <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Not shown publicly" />
                  </div>
                  <div className="flex items-center justify-between border rounded p-3">
                    <div>
                      <Label>Show on public Gift Wall</Label>
                      <p className="text-xs text-muted-foreground">Donor name shown anonymized</p>
                    </div>
                    <Switch checked={form.is_visible_on_wall} onCheckedChange={(v) => setForm({ ...form, is_visible_on_wall: v })} />
                  </div>
                  <Button onClick={editing ? submitEdit : submitNew} className="w-full bg-primary text-primary-foreground">
                    {editing ? "Save Changes (with reason)" : "Add Gift"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount / Item</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Wall</TableHead>
            <TableHead>Thanks</TableHead>
            {canEdit && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No records yet.</TableCell></TableRow>
          ) : filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="font-medium">{r.donor_name}</div>
                <div className="text-xs text-muted-foreground capitalize">{r.donor_type}{r.donor_phone && ` · ${r.donor_phone}`}</div>
              </TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded-full ${giftTypeBadgeClass(r.gift_type === "in_kind" ? "kind" : r.gift_type)}`}>
                  {giftTypeLabel(r.gift_type === "in_kind" ? "kind" : r.gift_type)}
                </span>
              </TableCell>
              <TableCell>
                {r.amount ? <span className="text-primary font-medium">GH₵{Number(r.amount).toLocaleString()}</span> : <span className="text-sm">{r.description || "—"}</span>}
                {r.amount && r.description && <div className="text-xs text-muted-foreground">{r.description}</div>}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(r.received_at).toLocaleDateString()}
                {r.received_by && <div>by {r.received_by}</div>}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => canEdit && handleVisibilityToggle(r)} disabled={!canEdit}>
                  {r.is_visible_on_wall ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => canEdit && handleThankYou(r)} disabled={!canEdit} className="gap-1">
                  <CheckCircle2 className={`h-4 w-4 ${r.thank_you_sent ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className="text-xs">{r.thank_you_sent ? "Sent" : "Pending"}</span>
                </Button>
              </TableCell>
              {canEdit && (
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setReasonOpen({ kind: "delete", id: r.id })} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {reasonOpen && (
        <ReasonDialog
          open
          onOpenChange={(v) => !v && setReasonOpen(null)}
          title={reasonOpen.kind === "delete" ? "Delete gift record" : "Edit gift record"}
          description="This action will be logged in the audit trail with your name and the reason you provide."
          confirmLabel={reasonOpen.kind === "delete" ? "Delete" : "Save"}
          destructive={reasonOpen.kind === "delete"}
          onConfirm={async (reason) => {
            try {
              if (reasonOpen.kind === "delete") {
                await adminApi("delete-gift-record", { id: reasonOpen.id, reason });
                toast.success("Deleted");
              } else {
                await adminApi("update-gift-record", { id: reasonOpen.id, ...(reasonOpen.payload || {}), reason });
                toast.success("Updated");
                setOpen(false); resetForm();
              }
              setReasonOpen(null);
              refresh();
            } catch (e: any) {
              toast.error(e.message);
            }
          }}
        />
      )}
    </div>
  );
}
