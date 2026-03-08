import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Heart, Loader2, Smartphone, Building2, Copy, Check, Users, Send } from "lucide-react";

interface GiftOption {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  image_url: string | null;
  collected: number;
}

interface GiftWallEntry {
  id: string;
  donor_name: string;
  gift_type: string;
  message: string | null;
  created_at: string;
}

export default function Gifts() {
  const [gifts, setGifts] = useState<GiftOption[]>([]);
  const [giftWall, setGiftWall] = useState<GiftWallEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<GiftOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Confirmation form state
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");

  const fetchGifts = async () => {
    try {
      const [giftsRes, wallRes] = await Promise.all([
        supabase.functions.invoke("payment-api", { body: { action: "get-gifts" } }),
        supabase.from("gift_wall").select("id, donor_name, gift_type, message, created_at").order("created_at", { ascending: false }),
      ]);
      if (giftsRes.error) throw giftsRes.error;
      setGifts(giftsRes.data.gifts || []);
      setGiftWall(wallRes.data || []);
    } catch {
      toast.error("Failed to load gifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleContribute = (gift: GiftOption) => {
    setSelectedGift(gift);
    setConfirmed(false);
    setDonorName("");
    setDonorMessage("");
    setIsModalOpen(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmGift = async () => {
    if (!donorName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("payment-api", {
        body: {
          action: "record-manual-gift",
          donor_name: donorName.trim(),
          message: donorMessage.trim() || null,
          gift_option_id: selectedGift?.id,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setConfirmed(true);
      toast.success("Thank you for your gift! 🎉");
      fetchGifts();
    } catch (e: any) {
      toast.error(e.message || "Failed to record gift");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencySymbol = "GH₵";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Gift className="w-8 h-8 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Gift Registry</h1>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              Your presence is our greatest gift. If you wish to bless us further, here are some things we'd love.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-body">Gift registry coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {gifts.map((gift) => {
                const progress = gift.target_amount > 0
                  ? Math.min((gift.collected / gift.target_amount) * 100, 100)
                  : 0;
                const isFunded = progress >= 100;

                return (
                  <div
                    key={gift.id}
                    className="bg-card border border-border rounded-xl overflow-hidden shadow-soft hover:shadow-elegant transition-shadow"
                  >
                    {gift.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={gift.image_url}
                          alt={gift.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-display text-xl text-foreground mb-2">{gift.title}</h3>
                      {gift.description && (
                        <p className="text-muted-foreground font-body text-sm mb-4">{gift.description}</p>
                      )}

                      {gift.target_amount > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm font-body mb-2">
                            <span className="text-muted-foreground">
                              {currencySymbol}{gift.collected.toLocaleString()} raised
                            </span>
                            <span className="text-foreground font-medium">
                              {currencySymbol}{gift.target_amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <Button
                        onClick={() => handleContribute(gift)}
                        disabled={isFunded}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isFunded ? "Fully Funded 🎉" : "Contribute"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Gift Wall */}
      {giftWall.length > 0 && (
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Users className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">Gift Wall</h2>
              <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
                A heartfelt thank you to everyone who has blessed us with a gift
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {giftWall.map((entry) => {
                const typeColor: Record<string, string> = {
                  cash: "bg-green-50 border-green-200",
                  kind: "bg-blue-50 border-blue-200",
                  both: "bg-purple-50 border-purple-200",
                };
                const badgeVariant: Record<string, string> = {
                  cash: "bg-green-100 text-green-700",
                  kind: "bg-blue-100 text-blue-700",
                  both: "bg-purple-100 text-purple-700",
                };
                return (
                  <div
                    key={entry.id}
                    className={`rounded-xl border p-4 text-center transition-shadow hover:shadow-md ${typeColor[entry.gift_type] || typeColor.cash}`}
                  >
                    <p className="font-display text-sm font-semibold text-foreground mb-2">{entry.donor_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${badgeVariant[entry.gift_type] || badgeVariant.cash}`}>
                      {entry.gift_type === "kind" ? "In Kind" : entry.gift_type === "both" ? "Cash & Kind" : "Cash"}
                    </span>
                    {entry.message && (
                      <p className="text-xs text-muted-foreground mt-2 italic">"{entry.message}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Payment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Contribute to {selectedGift?.title}
            </DialogTitle>
          </DialogHeader>

          {confirmed ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">Thank You!</h3>
              <p className="text-muted-foreground font-body text-sm">
                Your gift has been recorded. We truly appreciate your generosity!
              </p>
              <Button onClick={() => setIsModalOpen(false)} className="mt-4 bg-primary text-primary-foreground">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <p className="text-muted-foreground font-body text-sm">
                Send your gift via any of the options below, then confirm at the bottom so we can add you to our Gift Wall 💛
              </p>

              {/* MTN MoMo */}
              <div className="border border-border rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-yellow-600" />
                  <span className="font-body font-semibold text-foreground text-sm">MTN Mobile Money</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-foreground text-lg font-medium tracking-wide">024 6904618</span>
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
              <div className="border border-border rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  <span className="font-body font-semibold text-foreground text-sm">Telecel</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-foreground text-lg font-medium tracking-wide">020 4532502</span>
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
              <div className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-body font-semibold text-foreground text-sm">Bank Transfer</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm font-body">
                  <span className="text-muted-foreground">Account Name</span>
                  <span className="text-foreground font-medium">Asakiso Apiligu</span>
                  <span className="text-muted-foreground">Account No.</span>
                  <div className="flex items-center gap-1">
                    <span className="text-foreground font-medium">8011010337930</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("8011010337930", "acct")}
                      className="h-6 px-1"
                    >
                      {copiedField === "acct" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                  </div>
                  <span className="text-muted-foreground">Bank</span>
                  <span className="text-foreground font-medium">GCB Bank PLC</span>
                  <span className="text-muted-foreground">Swift Code</span>
                  <span className="text-foreground font-medium">GHCBGHAC</span>
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground font-body">After sending, confirm below</span>
                </div>
              </div>

              {/* Confirmation Form */}
              <div className="space-y-3">
                <div>
                  <Label className="font-body text-sm">Your Name *</Label>
                  <Input
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label className="font-body text-sm">Message (optional)</Label>
                  <Textarea
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    placeholder="A short note or blessing..."
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleConfirmGift}
                  disabled={isSubmitting || !donorName.trim()}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Confirm My Gift</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
