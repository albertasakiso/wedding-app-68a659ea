import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

interface SettingsTabProps {
  settings: any;
  onRefresh: () => void;
}

export default function SettingsTab({ settings, onRefresh }: SettingsTabProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    couple_names: "Albert & Ruby",
    wedding_date: "2026-05-02T15:00",
    tagline: "Together with their families",
    hero_image_url: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        couple_names: settings.couple_names || "Albert & Ruby",
        wedding_date: settings.wedding_date?.slice(0, 16) || "2026-05-02T15:00",
        tagline: settings.tagline || "",
        hero_image_url: settings.hero_image_url || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await adminApi("update-settings", {
        id: settings?.id || undefined,
        couple_names: form.couple_names,
        wedding_date: form.wedding_date,
        tagline: form.tagline,
        hero_image_url: form.hero_image_url || null,
      });
      toast({ title: "Settings saved" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Site Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Couple Names</label>
          <Input value={form.couple_names} onChange={(e) => setForm({ ...form, couple_names: e.target.value })} className="mt-1" placeholder="Albert & Ruby" />
          <p className="text-xs text-muted-foreground mt-1">Displayed on the hero section. Use "&" to separate names.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Wedding Date & Time</label>
          <Input type="datetime-local" value={form.wedding_date} onChange={(e) => setForm({ ...form, wedding_date: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Tagline / Subtitle</label>
          <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="mt-1" placeholder="Together with their families" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Hero Image URL (optional)</label>
          <Input value={form.hero_image_url} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} className="mt-1" placeholder="https://..." />
        </div>
        <Button onClick={handleSave} className="w-full">Save Settings</Button>
      </CardContent>
    </Card>
  );
}
