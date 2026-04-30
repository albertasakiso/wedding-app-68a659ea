import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Clock, MapPin } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import IconPicker from "./IconPicker";
import { getEventIcon } from "@/lib/event-icons";

interface EventsTabProps {
  events: any[];
  onRefresh: () => void;
}

export default function EventsTab({ events, onRefresh }: EventsTabProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_time: "",
    location: "",
    order_index: 0,
    icon: "Calendar",
    highlight_color: "",
  });

  const resetForm = () => {
    setForm({
      title: "", description: "", event_time: "", location: "",
      order_index: events.length, icon: "Calendar", highlight_color: "",
    });
    setEditing(null);
  };

  const openEdit = (evt: any) => {
    setEditing(evt);
    setForm({
      title: evt.title,
      description: evt.description || "",
      event_time: evt.event_time?.slice(0, 16) || "",
      location: evt.location || "",
      order_index: evt.order_index || 0,
      icon: evt.icon || "Calendar",
      highlight_color: evt.highlight_color || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        highlight_color: form.highlight_color || null,
      };
      if (editing) {
        await adminApi("update-event", { id: editing.id, ...payload });
        toast({ title: "Event updated" });
      } else {
        await adminApi("insert-event", payload);
        toast({ title: "Event added" });
      }
      setOpen(false);
      resetForm();
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await adminApi("delete-event", { id });
      toast({ title: "Event deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg text-foreground">Timeline Events</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}><Plus className="h-4 w-4" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Edit Event" : "New Event"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="datetime-local" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
              <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input type="number" placeholder="Order" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} />
              <div className="space-y-2">
                <Label className="text-sm">Icon</Label>
                <IconPicker value={form.icon} onChange={(name) => setForm({ ...form, icon: name })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Highlight Color (optional)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={form.highlight_color || "#D4AF37"}
                    onChange={(e) => setForm({ ...form, highlight_color: e.target.value })}
                    className="w-16 p-1 h-10"
                  />
                  <Input
                    value={form.highlight_color}
                    onChange={(e) => setForm({ ...form, highlight_color: e.target.value })}
                    placeholder="Leave empty to use theme primary"
                    className="flex-1"
                  />
                  {form.highlight_color && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, highlight_color: "" })}>Clear</Button>
                  )}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No events yet. Add your first event!</p>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <Card key={evt.id} className="border-primary/10">
              <CardContent className="pt-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{evt.title}</h4>
                  {evt.description && <p className="text-sm text-muted-foreground mt-1">{evt.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {evt.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(evt.event_time).toLocaleString()}
                      </span>
                    )}
                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {evt.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(evt)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(evt.id, evt.title)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
