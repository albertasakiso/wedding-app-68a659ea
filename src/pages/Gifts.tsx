import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhoneInput from "@/components/PhoneInput";
import { useMemo } from "react";
import { Gift, Heart, Loader2, Smartphone, Building2, Copy, Check, Users, Send, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { anonymizeEntry, formatGHS } from "@/lib/format-utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface GiftWallEntry {
  id: string;
  donor_name: string;
  gift_type: string;
  message: string | null;
  phone: string | null;
  created_at: string;
}

interface RSVPEntry {
  id: string;
  guest_name: string;
  phone: string | null;
  created_at: string;
}

interface GiftOption {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
}

interface GiftPayment {
  id: string;
  amount: number;
  gift_option_id: string;
  status: string;
}

export default function Gifts() {
  const [giftWall, setGiftWall] = useState<GiftWallEntry[]>([]);
  const [rsvpList, setRsvpList] = useState<RSVPEntry[]>([]);
  const [giftOptions, setGiftOptions] = useState<GiftOption[]>([]);
  const [payments, setPayments] = useState<GiftPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [giftType, setGiftType] = useState("momo");
  const { ref: wallRef, isVisible: wallVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: progressRef, isVisible: progressVisible } = useScrollReveal({ threshold: 0.1 });

  const fetchData = async () => {
    try {
      const [wallRes, rsvpRes, optionsRes, paymentsRes] = await Promise.all([
        supabase
          .from("gift_wall")
          .select("id, donor_name, gift_type, message, phone, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("rsvps")
          .select("id, guest_name, phone, created_at")
          .eq("attending", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("gift_options")
          .select("id, title, description, target_amount")
          .eq("is_active", true),
        supabase
          .from("gift_payments")
          .select("id, amount, gift_option_id, status"),
      ]);
      setGiftWall(wallRes.data || []);
      setRsvpList(rsvpRes.data || []);
      setGiftOptions(optionsRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useRealtimeTable("gift_wall", fetchData, "gifts-page-gift-wall");
  useRealtimeTable("rsvps", fetchData, "gifts-page-rsvps");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmGift = async () => {
    if (!donorName.trim()) return toast.error("Please enter your name");
    if (!donorPhone.trim()) return toast.error("Please enter your phone number");
    setIsSubmitting(true);
    try {
      const trimmedEmail = donorEmail.trim();
      const { error } = await supabase.from("gift_wall").insert({
        donor_name: donorName.trim(),
        phone: donorPhone.trim(),
        email: trimmedEmail || null,
        gift_type: giftType,
        message: donorMessage.trim() || null,
      });
      if (error) throw error;

      // Fire-and-forget thank-you email if donor provided one
      if (trimmedEmail) {
        supabase.functions
          .invoke("email-notifications", {
            body: {
              action: "send-gift-thankyou",
              donor_name: donorName.trim(),
              donor_email: trimmedEmail,
              amount: "",
              currency: "GHS",
              gift_title: "Wedding Gift",
            },
          })
          .catch(() => {});
      }

      setConfirmed(true);
      toast.success("Thank you for your gift! 🎉");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to record gift");
    } finally {
      setIsSubmitting(false);
    }
  };

  const giftTypeBadge: Record<string, { label: string; cls: string }> = {
    momo: { label: "MoMo", cls: "bg-yellow-100 text-yellow-800" },
    bank: { label: "Bank", cls: "bg-blue-100 text-blue-800" },
    cash: { label: "Cash", cls: "bg-green-100 text-green-800" },
    physical: { label: "Gift", cls: "bg-purple-100 text-purple-800" },
    kind: { label: "In Kind", cls: "bg-indigo-100 text-indigo-800" },
    both: { label: "Cash & Kind", cls: "bg-pink-100 text-pink-800" },
  };

  // Aggregate progress: sum of paid/pending payments per option, plus overall.
  const totalsByOption = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.gift_option_id] = (acc[p.gift_option_id] || 0) + Number(p.amount || 0);
    return acc;
  }, {});
  const totalReceived = Object.values(totalsByOption).reduce((a, b) => a + b, 0);
  const totalTarget = giftOptions.reduce((sum, o) => sum + Number(o.target_amount || 0), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalReceived / totalTarget) * 100)) : 0;
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Gift className="w-8 h-8 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Gift Registry</h1>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              Your presence is our greatest gift. If you wish to bless us further, you can send a gift via any of the options below.
            </p>
          </div>

          {/* Gift Goal Progress */}
          {giftOptions.length > 0 && totalTarget > 0 && (
            <div
              ref={progressRef}
              className={`max-w-2xl mx-auto mb-16 transition-all duration-700 ${
                progressVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="rounded-2xl bg-card border border-primary/10 p-6 md:p-8 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-xl text-foreground">Our Wedding Wishlist</h3>
                  </div>
                  <span className="text-sm font-body text-muted-foreground">
                    {formatGHS(totalReceived)} <span className="text-primary/60">/ {formatGHS(totalTarget)}</span>
                  </span>
                </div>
                <Progress value={overallPct} className="h-3 mb-2" />
                <p className="text-xs text-muted-foreground font-body text-right">{overallPct}% funded · {payments.length} contributions</p>

                <div className="mt-6 space-y-4">
                  {giftOptions.map((opt) => {
                    const received = totalsByOption[opt.id] || 0;
                    const pct = Number(opt.target_amount) > 0 ? Math.min(100, Math.round((received / Number(opt.target_amount)) * 100)) : 0;
                    return (
                      <div key={opt.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm text-foreground font-medium">{opt.title}</span>
                          <span className="font-body text-xs text-muted-foreground">
                            {formatGHS(received)} / {formatGHS(Number(opt.target_amount))}
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="max-w-xl mx-auto space-y-5 mb-16">
            {/* MTN MoMo */}
            <div className="rounded-xl p-6 bg-card shadow-sm hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-yellow-600" />
                <span className="font-body font-semibold text-foreground">MTN Mobile Money</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-sans text-2xl font-bold tracking-wider transition-colors duration-300 ${copiedField === "mtn" ? "text-primary" : "text-foreground"}`}>024 6904618</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("0246904618", "mtn")}
                  className="h-8 px-2"
                >
                  {copiedField === "mtn" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {/* Telecel */}
            <div className="rounded-xl p-6 bg-card shadow-sm hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-red-600" />
                <span className="font-body font-semibold text-foreground">Telecel</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-sans text-2xl font-bold tracking-wider transition-colors duration-300 ${copiedField === "telecel" ? "text-primary" : "text-foreground"}`}>020 4532502</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("0204532502", "telecel")}
                  className="h-8 px-2"
                >
                  {copiedField === "telecel" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {/* Bank */}
            <div className="rounded-xl p-6 bg-card shadow-sm hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-body font-semibold text-foreground">Bank Transfer</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Account Name</span>
                  <span className="font-sans text-lg font-bold text-foreground">Asakiso Apiligu</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Account No.</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-sans text-xl font-bold tracking-wider transition-colors duration-300 ${copiedField === "acct" ? "text-primary" : "text-foreground"}`}>8011010337930</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("8011010337930", "acct")}
                      className="h-6 px-1"
                    >
                      {copiedField === "acct" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Bank</span>
                  <span className="font-sans text-lg font-bold text-foreground">GCB Bank PLC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Swift Code</span>
                  <span className="font-sans text-lg font-bold text-foreground tracking-wider">GHCBGHAC</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground font-body">After sending, let us know below 💛</span>
              </div>
            </div>

            {/* Confirmation Form */}
            {confirmed ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">Thank You!</h3>
                <p className="text-muted-foreground font-body text-sm">
                  Your gift has been recorded. We truly appreciate your generosity!
                </p>
                <Button
                  onClick={() => { setConfirmed(false); setDonorName(""); setDonorPhone(""); setDonorEmail(""); setDonorMessage(""); setGiftType("momo"); }}
                  variant="outline"
                  className="mt-4"
                >
                  Send Another
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="font-body text-sm">Your Name *</Label>
                  <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <Label className="font-body text-sm">Phone Number *</Label>
                  <PhoneInput value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
                </div>
                <div>
                  <Label className="font-body text-sm">Email (optional, for thank-you)</Label>
                  <Input value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="you@example.com" type="email" />
                </div>
                <div>
                  <Label className="font-body text-sm">Gift Type *</Label>
                  <Select value={giftType} onValueChange={setGiftType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="momo">MoMo</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="physical">Physical Gift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-body text-sm">Message (optional)</Label>
                  <Textarea value={donorMessage} onChange={(e) => setDonorMessage(e.target.value)} placeholder="A short note or blessing..." rows={2} />
                </div>
                <Button
                  onClick={handleConfirmGift}
                  disabled={isSubmitting || !donorName.trim() || !donorPhone.trim()}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Confirm My Gift</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Two-Column Public Wall */}
      {!loading && (rsvpList.length > 0 || giftWall.length > 0) && (
        <section
          ref={wallRef}
          className={`pb-20 transition-all duration-700 ${wallVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Users className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">Celebration Wall</h2>
              <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
                {rsvpList.length} attending · {giftWall.length} gifts received
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* RSVP Column */}
              <div>
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" /> RSVP'd Guests
                </h3>
                <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2">
                  {rsvpList.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {anonymizeEntry(entry.guest_name, entry.phone)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        RSVP
                      </span>
                    </div>
                  ))}
                  {rsvpList.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No RSVPs yet</p>
                  )}
                </div>
              </div>

              {/* Gifts Column */}
              <div>
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" /> Gifts Received
                </h3>
                <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2">
                  {giftWall.map((entry) => {
                    const badge = giftTypeBadge[entry.gift_type] || giftTypeBadge.cash;
                    return (
                      <div key={entry.id} className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm">
                        <span className="font-sans text-sm font-medium text-foreground">
                          {anonymizeEntry(entry.donor_name, entry.phone)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                  {giftWall.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No gifts yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
