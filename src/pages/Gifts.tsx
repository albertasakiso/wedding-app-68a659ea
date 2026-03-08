import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Heart, Loader2, CreditCard, Smartphone, Building2, Check, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface PaymentSettings {
  paystack_public_key: string | null;
  stripe_public_key: string | null;
  momo_enabled: boolean;
  card_enabled: boolean;
  bank_enabled: boolean;
  currency: string;
}

export default function Gifts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gifts, setGifts] = useState<GiftOption[]>([]);
  const [giftWall, setGiftWall] = useState<GiftWallEntry[]>([]);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<GiftOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verified, setVerified] = useState(false);

  // Form state
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const fetchGifts = async () => {
    try {
      const [giftsRes, wallRes] = await Promise.all([
        supabase.functions.invoke("payment-api", { body: { action: "get-gifts" } }),
        supabase.from("gift_wall").select("id, donor_name, gift_type, message, created_at").order("created_at", { ascending: false }),
      ]);
      if (giftsRes.error) throw giftsRes.error;
      setGifts(giftsRes.data.gifts || []);
      setSettings(giftsRes.data.settings || null);
      setGiftWall(wallRes.data || []);
    } catch {
      toast.error("Failed to load gifts");
    } finally {
      setLoading(false);
    }
  };

  // Verify payment on return
  useEffect(() => {
    const verifyParam = searchParams.get("verify");
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const sessionId = searchParams.get("session_id");

    if (verifyParam === "paystack" && reference) {
      supabase.functions
        .invoke("payment-api", { body: { action: "verify-paystack", reference } })
        .then(({ data }) => {
          if (data?.verified) {
            setVerified(true);
            toast.success("Thank you for your generous gift! 🎉");
          } else {
            toast.error("Payment could not be verified");
          }
          setSearchParams({});
          fetchGifts();
        });
    } else if (verifyParam === "stripe" && sessionId) {
      supabase.functions
        .invoke("payment-api", { body: { action: "verify-stripe", session_id: sessionId } })
        .then(({ data }) => {
          if (data?.verified) {
            setVerified(true);
            toast.success("Thank you for your generous gift! 🎉");
          } else {
            toast.error("Payment could not be verified");
          }
          setSearchParams({});
          fetchGifts();
        });
    }
  }, []);

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleContribute = (gift: GiftOption) => {
    setSelectedGift(gift);
    setAmount("");
    setPaymentMethod("card");
    setIsModalOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedGift || !donorName.trim() || !amount || Number(amount) <= 0) {
      toast.error("Please fill in your name and a valid amount");
      return;
    }

    setIsProcessing(true);
    const callbackUrl = window.location.origin + "/gifts";

    try {
      if (paymentMethod === "card" && settings?.stripe_public_key) {
        // Use Stripe for international cards
        const { data, error } = await supabase.functions.invoke("payment-api", {
          body: {
            action: "create-stripe-session",
            gift_option_id: selectedGift.id,
            gift_title: selectedGift.title,
            donor_name: donorName,
            donor_email: donorEmail,
            donor_phone: donorPhone,
            amount: Number(amount),
            callback_url: callbackUrl,
          },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message);
        window.location.href = data.url;
        return;
      }

      // Use Paystack for MoMo, card, bank
      const { data, error } = await supabase.functions.invoke("payment-api", {
        body: {
          action: "initialize-paystack",
          gift_option_id: selectedGift.id,
          donor_name: donorName,
          donor_email: donorEmail,
          donor_phone: donorPhone,
          amount: Number(amount),
          payment_method: paymentMethod,
          callback_url: callbackUrl + "?verify=paystack",
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      window.location.href = data.authorization_url;
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  const currencySymbol = settings?.currency === "USD" ? "$" : settings?.currency === "EUR" ? "€" : "GH₵";

  if (verified) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl text-foreground mb-4">Thank You!</h1>
            <p className="text-muted-foreground font-body mb-8">
              Your generous gift has been received. We truly appreciate your love and support!
            </p>
            <Button onClick={() => setVerified(false)} className="bg-primary text-primary-foreground">
              Back to Gifts
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

      {/* Payment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Contribute to {selectedGift?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="font-body">Your Name *</Label>
              <Input
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label className="font-body">Email</Label>
              <Input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label className="font-body">Phone</Label>
              <Input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="0XX XXX XXXX"
              />
            </div>
            <div>
              <Label className="font-body">Amount ({currencySymbol}) *</Label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
              />
            </div>

            <div>
              <Label className="font-body mb-3 block">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                {settings?.momo_enabled && (
                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="momo" id="momo" />
                    <Smartphone className="w-4 h-4 text-primary" />
                    <Label htmlFor="momo" className="cursor-pointer font-body">Mobile Money (MoMo)</Label>
                  </div>
                )}
                {settings?.card_enabled && (
                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="w-4 h-4 text-primary" />
                    <Label htmlFor="card" className="cursor-pointer font-body">Card Payment</Label>
                  </div>
                )}
                {settings?.bank_enabled && (
                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="bank" id="bank" />
                    <Building2 className="w-4 h-4 text-primary" />
                    <Label htmlFor="bank" className="cursor-pointer font-body">Bank Transfer</Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || !donorName.trim() || !amount}
              className="w-full bg-primary text-primary-foreground"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Pay {currencySymbol}{amount || "0"}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
