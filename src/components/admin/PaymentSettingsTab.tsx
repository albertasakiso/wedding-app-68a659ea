import { useState, useEffect } from "react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";

interface PaymentSettingsData {
  id?: string;
  momo_enabled: boolean;
  card_enabled: boolean;
  bank_enabled: boolean;
  currency: string;
}

interface PaymentSettingsTabProps {
  settings: PaymentSettingsData | null;
  onRefresh: () => void;
}

export default function PaymentSettingsTab({ settings, onRefresh }: PaymentSettingsTabProps) {
  const [form, setForm] = useState<PaymentSettingsData>({
    momo_enabled: true,
    card_enabled: true,
    bank_enabled: true,
    currency: "GHS",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi("update-payment-settings", {
        id: settings?.id || undefined,
        ...form,
      });
      toast.success("Payment settings saved");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Accepted Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Toggle which payment options appear on the public Gifts page. Account details are managed in the Gifts page itself (manual MoMo/Bank).
          </p>
          <div className="flex items-center justify-between">
            <Label>Mobile Money (MoMo)</Label>
            <Switch checked={form.momo_enabled} onCheckedChange={(c) => setForm({ ...form, momo_enabled: c })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Card Payment</Label>
            <Switch checked={form.card_enabled} onCheckedChange={(c) => setForm({ ...form, card_enabled: c })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Bank Transfer</Label>
            <Switch checked={form.bank_enabled} onCheckedChange={(c) => setForm({ ...form, bank_enabled: c })} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              placeholder="GHS"
              maxLength={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Settings
      </Button>
    </div>
  );
}
