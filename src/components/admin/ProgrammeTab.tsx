import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

type Row = Record<string, any>;

interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ConfigEntry {
  label: string;
  table: string;
  fields: FieldDef[];
  display: (r: Row) => { title: string; subtitle?: string };
}

const CONFIG: Record<string, ConfigEntry> = {
  order_of_service: {
    label: "Order of Service",
    table: "programme_order_of_service",
    fields: [
      { key: "item", label: "Item" },
      { key: "led_by", label: "Led by (optional)" },
      { key: "order_index", label: "Order", type: "number" },
    ],
    display: (r) => ({ title: r.item, subtitle: r.led_by }),
  },
  functionaries: {
    label: "Functionaries",
    table: "programme_functionaries",
    fields: [
      { key: "group_key", label: "Group", type: "select", options: [
        { value: "ministers", label: "Officiating Ministers" },
        { value: "counsellors", label: "Counsellors" },
        { value: "protocol", label: "Protocol" },
      ] },
      { key: "name", label: "Name" },
      { key: "affiliation", label: "Affiliation (optional)" },
      { key: "order_index", label: "Order", type: "number" },
    ],
    display: (r) => ({ title: r.name, subtitle: `${r.group_key}${r.affiliation ? " · " + r.affiliation : ""}` }),
  },
  hymns: {
    label: "Hymns",
    table: "programme_hymns",
    fields: [
      { key: "title", label: "Title" },
      { key: "reference", label: "Reference (e.g. PSB-T 133)" },
      { key: "author", label: "Author" },
      { key: "lyrics", label: "Lyrics", type: "textarea" },
      { key: "order_index", label: "Order", type: "number" },
    ],
    display: (r) => ({ title: r.title, subtitle: r.reference || r.author }),
  },
  photography: {
    label: "Photography",
    table: "programme_photography",
    fields: [
      { key: "category", label: "Category", type: "select", options: [
        { value: "order", label: "Order of Photography" },
        { value: "exclusives", label: "Exclusives" },
      ] },
      { key: "label", label: "Label" },
      { key: "order_index", label: "Order", type: "number" },
    ],
    display: (r) => ({ title: r.label, subtitle: r.category }),
  },
  credits: {
    label: "Credits",
    table: "programme_credits",
    fields: [
      { key: "role", label: "Role (e.g. Best Man, Photography)" },
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone (optional)" },
      { key: "order_index", label: "Order", type: "number" },
    ],
    display: (r) => ({ title: r.name, subtitle: `${r.role}${r.phone ? " · " + r.phone : ""}` }),
  },
};

function CrudPanel({ entry }: { entry: ConfigEntry }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi("list-programme", { table: entry.table });
      setRows(res.rows || []);
    } catch (e: any) {
      toast({ title: "Failed to load", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [entry.table]);

  const reset = () => {
    const blank: Row = { order_index: rows.length };
    entry.fields.forEach((f) => { if (!(f.key in blank)) blank[f.key] = f.type === "number" ? 0 : ""; });
    if (entry.fields.find((f) => f.key === "group_key")) blank.group_key ||= "ministers";
    if (entry.fields.find((f) => f.key === "category")) blank.category ||= "order";
    setForm(blank);
    setEditing(null);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    const f: Row = {};
    entry.fields.forEach((fd) => { f[fd.key] = r[fd.key] ?? (fd.type === "number" ? 0 : ""); });
    setForm(f);
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload: Row = { table: entry.table };
      entry.fields.forEach((f) => {
        let v = form[f.key];
        if (f.type === "number") v = Number(v) || 0;
        if (typeof v === "string" && v.trim() === "" && f.key !== "name" && f.key !== "item" && f.key !== "title" && f.key !== "label" && f.key !== "role") v = null;
        payload[f.key] = v;
      });
      if (editing) {
        await adminApi("update-programme", { ...payload, id: editing.id });
        toast({ title: "Updated" });
      } else {
        await adminApi("insert-programme", payload);
        toast({ title: "Added" });
      }
      setOpen(false);
      reset();
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const remove = async (r: Row) => {
    const d = entry.display(r);
    if (!confirm(`Delete "${d.title}"?`)) return;
    try {
      await adminApi("delete-programme", { table: entry.table, id: r.id });
      toast({ title: "Deleted" });
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg text-foreground">{entry.label}</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={reset}><Plus className="h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Edit" : "New"} {entry.label.replace(/s$/, "")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {entry.fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-sm">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea rows={8} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  ) : f.type === "select" ? (
                    <Select value={form[f.key] ?? ""} onValueChange={(v) => setForm({ ...form, [f.key]: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {f.options!.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : f.type === "number" ? (
                    <Input type="number" value={form[f.key] ?? 0} onChange={(e) => setForm({ ...form, [f.key]: parseInt(e.target.value) || 0 })} />
                  ) : (
                    <Input value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
              <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nothing here yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const d = entry.display(r);
            return (
              <Card key={r.id} className="border-primary/10">
                <CardContent className="pt-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{d.title}</p>
                    {d.subtitle && <p className="text-sm text-muted-foreground truncate">{d.subtitle}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ThankYouPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<Row | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi("list-programme", { table: "programme_thank_you" });
      setRow(res.rows?.[0] || { body: "", verse_reference: "", verse_text: "" });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await adminApi("upsert-programme-thank-you", {
        id: row?.id,
        body: row?.body || "",
        verse_reference: row?.verse_reference || null,
        verse_text: row?.verse_text || null,
      });
      toast({ title: "Saved" });
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (loading || !row) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-1">
        <Label>Thank you note</Label>
        <Textarea rows={10} value={row.body || ""} onChange={(e) => setRow({ ...row, body: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Verse reference (e.g. Jeremiah 17:7)</Label>
          <Input value={row.verse_reference || ""} onChange={(e) => setRow({ ...row, verse_reference: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Verse text</Label>
          <Input value={row.verse_text || ""} onChange={(e) => setRow({ ...row, verse_text: e.target.value })} />
        </div>
      </div>
      <Button onClick={save}>Save Thank You</Button>
    </div>
  );
}

export default function ProgrammeTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-primary">Wedding Programme</h2>
        <p className="text-sm text-muted-foreground">Manage every section that appears on the public /programme page.</p>
      </div>
      <Tabs defaultValue="order_of_service">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="order_of_service">Order of Service</TabsTrigger>
          <TabsTrigger value="functionaries">Functionaries</TabsTrigger>
          <TabsTrigger value="hymns">Hymns</TabsTrigger>
          <TabsTrigger value="photography">Photography</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="thank_you">Thank You</TabsTrigger>
        </TabsList>
        <TabsContent value="order_of_service" className="mt-4"><CrudPanel entry={CONFIG.order_of_service} /></TabsContent>
        <TabsContent value="functionaries" className="mt-4"><CrudPanel entry={CONFIG.functionaries} /></TabsContent>
        <TabsContent value="hymns" className="mt-4"><CrudPanel entry={CONFIG.hymns} /></TabsContent>
        <TabsContent value="photography" className="mt-4"><CrudPanel entry={CONFIG.photography} /></TabsContent>
        <TabsContent value="credits" className="mt-4"><CrudPanel entry={CONFIG.credits} /></TabsContent>
        <TabsContent value="thank_you" className="mt-4"><ThankYouPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
