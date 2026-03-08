import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

interface VenueTabProps {
  venue: any;
  onRefresh: () => void;
}

export default function VenueTab({ venue, onRefresh }: VenueTabProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", address: "", map_url: "", parking_info: "", hotels: "[]",
  });

  useEffect(() => {
    if (venue) {
      setForm({
        name: venue.name || "",
        address: venue.address || "",
        map_url: venue.map_url || "",
        parking_info: venue.parking_info || "",
        hotels: JSON.stringify(venue.hotels || [], null, 2),
      });
    }
  }, [venue]);

  const handleSave = async () => {
    try {
      let hotels;
      try {
        hotels = JSON.parse(form.hotels);
      } catch {
        toast({ title: "Invalid JSON in hotels field", variant: "destructive" });
        return;
      }
      await adminApi("update-venue", {
        id: venue?.id || undefined,
        name: form.name,
        address: form.address,
        map_url: form.map_url,
        parking_info: form.parking_info,
        hotels,
      });
      toast({ title: "Venue updated" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="font-display">Venue Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Venue Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Address</label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Google Maps URL</label>
          <Input value={form.map_url} onChange={(e) => setForm({ ...form, map_url: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Parking Info</label>
          <Textarea value={form.parking_info} onChange={(e) => setForm({ ...form, parking_info: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Hotels (JSON array)</label>
          <Textarea value={form.hotels} onChange={(e) => setForm({ ...form, hotels: e.target.value })} className="mt-1 font-mono text-xs" rows={6} />
          <p className="text-xs text-muted-foreground mt-1">Format: [{"{"}"name": "Hotel Name", "distance": "5 min", "url": "https://..."{"}"}]</p>
        </div>
        <Button onClick={handleSave} className="w-full">Save Venue</Button>
      </CardContent>
    </Card>
  );
}
