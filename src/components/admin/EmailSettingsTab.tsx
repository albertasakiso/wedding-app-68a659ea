import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Mail, Save, Loader2 } from "lucide-react";

interface EmailSettingsTabProps {
  settings: any;
  onRefresh: () => void;
}

export default function EmailSettingsTab({ settings, onRefresh }: EmailSettingsTabProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    admin_email: settings?.admin_email || "",
    sender_name: settings?.sender_name || "Albert & Ruby Wedding",
    sender_email: settings?.sender_email || "",
    rsvp_notification_enabled: settings?.rsvp_notification_enabled ?? true,
    gift_notification_enabled: settings?.gift_notification_enabled ?? true,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi("update-email-settings", { id: settings?.id, ...form });
      toast.success("Email settings saved!");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-display text-foreground">Email Notifications</h2>
          <p className="text-sm text-muted-foreground">Configure Brevo email notifications for RSVPs and gifts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sender Settings</CardTitle>
          <CardDescription>Configure who emails are sent from</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Admin Email (receives alerts)</Label>
            <Input
              value={form.admin_email}
              onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <Label>Sender Name</Label>
            <Input
              value={form.sender_name}
              onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
              placeholder="Albert & Ruby Wedding"
            />
          </div>
          <div>
            <Label>Sender Email (must be verified in Brevo)</Label>
            <Input
              value={form.sender_email}
              onChange={(e) => setForm({ ...form, sender_email: e.target.value })}
              placeholder="wedding@yourdomain.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Toggles</CardTitle>
          <CardDescription>Control which notifications are sent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">RSVP Notifications</p>
              <p className="text-sm text-muted-foreground">Confirmation to guest + alert to admin</p>
            </div>
            <Switch
              checked={form.rsvp_notification_enabled}
              onCheckedChange={(v) => setForm({ ...form, rsvp_notification_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Gift Notifications</p>
              <p className="text-sm text-muted-foreground">Thank-you to donor + alert to admin</p>
            </div>
            <Switch
              checked={form.gift_notification_enabled}
              onCheckedChange={(v) => setForm({ ...form, gift_notification_enabled: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Email Settings
      </Button>
    </div>
  );
}
