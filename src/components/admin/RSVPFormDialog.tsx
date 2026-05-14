import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import type { RSVPRow } from "./types";

interface RSVPFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: RSVPRow | null;
  onSaved: () => void;
}

const empty = {
  guest_name: "",
  phone: "",
  email: "",
  attending: true,
  plus_one_name: "",
  message: "",
};

export default function RSVPFormDialog({ open, onOpenChange, editing, onSaved }: RSVPFormDialogProps) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editing) {
      setForm({
        guest_name: editing.guest_name || "",
        phone: editing.phone || "",
        email: editing.email || "",
        attending: !!editing.attending,
        plus_one_name: editing.plus_one_name || "",
        message: editing.message || "",
      });
    } else {
      setForm(empty);
    }
  }, [editing, open]);

  const handleSave = async () => {
    if (!form.guest_name.trim()) {
      toast({ title: "Guest name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        guest_name: form.guest_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        attending: form.attending,
        plus_one_name: form.plus_one_name.trim() || null,
        message: form.message.trim() || null,
      };
      if (editing) {
        await adminApi("update-rsvp", { id: editing.id, ...payload });
        toast({ title: "RSVP updated" });
      } else {
        await adminApi("insert-rsvp", payload);
        toast({ title: "RSVP added" });
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">{editing ? "Edit RSVP" : "Add Manual RSVP"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Guest Name *</Label>
            <Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233…" />
            </div>
            <div>
              <Label className="text-sm">Email (optional)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-sm">Plus One (optional)</Label>
            <Input value={form.plus_one_name} onChange={(e) => setForm({ ...form, plus_one_name: e.target.value })} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-primary/20 px-3 py-2">
            <Label className="text-sm">Attending</Label>
            <Switch checked={form.attending} onCheckedChange={(v) => setForm({ ...form, attending: v })} />
          </div>
          <div>
            <Label className="text-sm">Message (optional)</Label>
            <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {editing ? "Update RSVP" : "Add RSVP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
