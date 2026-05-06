import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Save, Loader2, CheckCircle2, XCircle, Send, ExternalLink } from "lucide-react";

interface EmailSettingsTabProps {
  settings: any;
  onRefresh: () => void;
}

export default function EmailSettingsTab({ settings, onRefresh }: EmailSettingsTabProps) {
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [form, setForm] = useState({
    admin_email: settings?.admin_email || "",
    sender_name: settings?.sender_name || "Albert & Ruby Wedding",
    sender_email: settings?.sender_email || "",
    sender_reply_to: settings?.sender_reply_to || "",
    sender_domain: settings?.sender_domain || "",
    rsvp_notification_enabled: settings?.rsvp_notification_enabled ?? true,
    gift_notification_enabled: settings?.gift_notification_enabled ?? true,
    gift_thankyou_subject: settings?.gift_thankyou_subject || "Thank You for Your Gift! — Albert & Ruby",
    gift_thankyou_message: settings?.gift_thankyou_message || "Your generous contribution means the world to us. We truly appreciate your love and support as we begin this new chapter together.",
    rsvp_confirmation_subject: settings?.rsvp_confirmation_subject || "RSVP Confirmation — Albert & Ruby Wedding",
    rsvp_confirmation_message: settings?.rsvp_confirmation_message || "Thank you for your RSVP! We can't wait to celebrate with you.",
    rsvp_reminder_subject: settings?.rsvp_reminder_subject || "Reminder: Albert & Ruby Wedding is Coming!",
    rsvp_reminder_message: settings?.rsvp_reminder_message || "Just a friendly reminder that our wedding is coming up soon. We can't wait to see you there!",
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

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res: any = await adminApi("verify-brevo-key", {});
      if (res?.ok) {
        setVerifyResult({ ok: true, message: `Connected as ${res.email || "Brevo account"} (${res.companyName || "verified"})` });
      } else {
        setVerifyResult({ ok: false, message: res?.message || "Brevo key invalid" });
      }
    } catch (e: any) {
      setVerifyResult({ ok: false, message: e.message || "Verification failed" });
    } finally {
      setVerifying(false);
    }
  };

  const handleTest = async () => {
    const recipient = testEmail.trim() || form.admin_email.trim();
    if (!recipient) {
      toast.error("Provide a recipient email or set the admin email first");
      return;
    }
    setTesting(true);
    try {
      // Save current settings first so the test uses the latest values
      await adminApi("update-email-settings", { id: settings?.id, ...form });
      const res: any = await adminApi("send-test-email", { recipient });
      if (res?.ok) {
        toast.success(`Test email sent to ${recipient} ✓`);
      } else {
        toast.error(res?.message || "Failed to send test email");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-display text-foreground">Email Notifications</h2>
          <p className="text-sm text-muted-foreground">All emails are sent through Brevo (Sendinblue). Configure your verified sender below.</p>
        </div>
      </div>

      {/* Connection check + test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connection &amp; Test</CardTitle>
          <CardDescription>Verify the Brevo API key and send a real test email to confirm deliverability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleVerify} disabled={verifying} variant="outline" className="gap-2">
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Verify Brevo Connection
            </Button>
          </div>
          {verifyResult && (
            <div className={`flex items-start gap-2 text-sm rounded-md p-3 ${verifyResult.ok ? "bg-green-50 text-green-900 border border-green-200" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
              {verifyResult.ok ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <XCircle className="h-4 w-4 mt-0.5" />}
              <span>{verifyResult.message}</span>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <Label>Send test email to</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder={form.admin_email || "test@example.com"}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                type="email"
              />
              <Button onClick={handleTest} disabled={testing} className="gap-2 shrink-0">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saves your current settings, then sends a styled test message using your sender name &amp; email.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sender Settings</CardTitle>
          <CardDescription>Configure who emails are sent from. The sender email <strong>must be a verified sender in Brevo</strong> for deliverability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Admin Email (receives RSVP &amp; gift alerts)</Label>
            <Input value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} placeholder="admin@example.com" type="email" />
          </div>
          <div>
            <Label>Sender Name</Label>
            <Input value={form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} placeholder="Albert & Ruby Wedding" />
          </div>
          <div>
            <Label>Sender Email</Label>
            <Input value={form.sender_email} onChange={(e) => setForm({ ...form, sender_email: e.target.value })} placeholder="wedding@yourdomain.com" type="email" />
            <p className="text-xs text-muted-foreground mt-1">
              Add &amp; verify this address in{" "}
              <a href="https://app.brevo.com/senders/list" target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                Brevo → Senders <ExternalLink className="h-3 w-3" />
              </a>
              {" "}before saving.
            </p>
          </div>
          <div>
            <Label>Reply-To (optional)</Label>
            <Input value={form.sender_reply_to} onChange={(e) => setForm({ ...form, sender_reply_to: e.target.value })} placeholder="couple@yourdomain.com" type="email" />
            <p className="text-xs text-muted-foreground mt-1">When guests hit "Reply", their reply will go here instead of the sender address.</p>
          </div>
          <div>
            <Label>Sender Domain (optional, for deliverability)</Label>
            <Input value={form.sender_domain} onChange={(e) => setForm({ ...form, sender_domain: e.target.value })} placeholder="yourdomain.com" />
            <p className="text-xs text-muted-foreground mt-1">
              For best inbox placement, authenticate this domain in Brevo by adding{" "}
              <strong>SPF</strong> and <strong>DKIM</strong> DNS records (
              <a href="https://app.brevo.com/senders/domain/list" target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                Brevo → Domains <ExternalLink className="h-3 w-3" />
              </a>
              ).
            </p>
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
            <Switch checked={form.rsvp_notification_enabled} onCheckedChange={(v) => setForm({ ...form, rsvp_notification_enabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Gift Notifications</p>
              <p className="text-sm text-muted-foreground">Thank-you to donor + alert to admin</p>
            </div>
            <Switch checked={form.gift_notification_enabled} onCheckedChange={(v) => setForm({ ...form, gift_notification_enabled: v })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RSVP Confirmation Email</CardTitle>
          <CardDescription>Customize the confirmation email sent to guests after RSVP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject Line</Label>
            <Input value={form.rsvp_confirmation_subject} onChange={(e) => setForm({ ...form, rsvp_confirmation_subject: e.target.value })} />
          </div>
          <div>
            <Label>Message Body</Label>
            <Textarea value={form.rsvp_confirmation_message} onChange={(e) => setForm({ ...form, rsvp_confirmation_message: e.target.value })} rows={3} />
            <p className="text-xs text-muted-foreground mt-1">
              Available variables: <code>{"{guest_name}"}</code>, <code>{"{attending}"}</code>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RSVP Reminder Email</CardTitle>
          <CardDescription>Customize the reminder email sent to guests before the wedding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject Line</Label>
            <Input value={form.rsvp_reminder_subject} onChange={(e) => setForm({ ...form, rsvp_reminder_subject: e.target.value })} />
          </div>
          <div>
            <Label>Message Body</Label>
            <Textarea value={form.rsvp_reminder_message} onChange={(e) => setForm({ ...form, rsvp_reminder_message: e.target.value })} rows={3} />
            <p className="text-xs text-muted-foreground mt-1">
              Available variables: <code>{"{guest_name}"}</code>, <code>{"{wedding_date}"}</code>, <code>{"{venue_name}"}</code>, <code>{"{venue_address}"}</code>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gift Thank-You Email</CardTitle>
          <CardDescription>Customize the thank-you email sent to donors after a gift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject Line</Label>
            <Input value={form.gift_thankyou_subject} onChange={(e) => setForm({ ...form, gift_thankyou_subject: e.target.value })} />
          </div>
          <div>
            <Label>Message Body</Label>
            <Textarea value={form.gift_thankyou_message} onChange={(e) => setForm({ ...form, gift_thankyou_message: e.target.value })} rows={4} />
            <p className="text-xs text-muted-foreground mt-1">
              Available variables: <code>{"{donor_name}"}</code>, <code>{"{amount}"}</code>, <code>{"{currency}"}</code>, <code>{"{gift_title}"}</code>
            </p>
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
