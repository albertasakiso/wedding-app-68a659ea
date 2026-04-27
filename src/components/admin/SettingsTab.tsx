import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, X } from "lucide-react";

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
    dress_code: "",
    dress_code_colors: [] as string[],
  });
  const [newColor, setNewColor] = useState("#D4AF37");

  useEffect(() => {
    if (settings) {
      setForm({
        couple_names: settings.couple_names || "Albert & Ruby",
        wedding_date: settings.wedding_date?.slice(0, 16) || "2026-05-02T15:00",
        tagline: settings.tagline || "",
        hero_image_url: settings.hero_image_url || "",
        dress_code: settings.dress_code || "",
        dress_code_colors: settings.dress_code_colors || [],
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
        dress_code: form.dress_code || null,
        dress_code_colors: form.dress_code_colors,
      });
      toast({ title: "Settings saved" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const addColor = () => {
    if (!newColor || form.dress_code_colors.includes(newColor)) return;
    setForm({ ...form, dress_code_colors: [...form.dress_code_colors, newColor] });
  };
  const removeColor = (c: string) => {
    setForm({ ...form, dress_code_colors: form.dress_code_colors.filter((x) => x !== c) });
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

        <div className="pt-4 border-t border-primary/10">
          <label className="text-sm font-medium text-foreground">Dress Code (optional)</label>
          <Textarea
            value={form.dress_code}
            onChange={(e) => setForm({ ...form, dress_code: e.target.value })}
            className="mt-1"
            placeholder="e.g., Formal attire — gold and ivory tones encouraged."
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Dress Code Colors</label>
          <div className="flex gap-2 mt-1">
            <Input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-16 p-1 h-10" />
            <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="#D4AF37" className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={addColor}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {form.dress_code_colors.map((c) => (
              <div key={c} className="flex items-center gap-1 bg-muted rounded-full pl-1 pr-2 py-1">
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: c }} />
                <span className="text-xs font-mono">{c}</span>
                <button onClick={() => removeColor(c)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {form.dress_code_colors.length === 0 && (
              <p className="text-xs text-muted-foreground">No colors added yet.</p>
            )}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">Save Settings</Button>
      </CardContent>
    </Card>
  );
}
