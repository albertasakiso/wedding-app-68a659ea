import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, MessageCircle, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareInviteProps {
  coupleNames: string;
  dateStr: string;
}

export default function ShareInvite({ coupleNames, dateStr }: ShareInviteProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = typeof window !== "undefined" ? window.location.origin : "";
  const text = `You're invited to ${coupleNames}'s wedding on ${dateStr}! 💍 RSVP here: ${url}`;

  const tryNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${coupleNames} Wedding`, text, url });
        return;
      } catch {
        // user cancelled, fall through to dialog
      }
    }
    setOpen(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Invitation copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={tryNativeShare}
        className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-6 text-lg font-display gap-2"
      >
        <Share2 className="w-5 h-5" /> Share Invite
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Share the Invitation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-primary/10 p-4 hover:bg-primary/5 transition"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="font-body">WhatsApp</span>
            </a>
            <a
              href={`sms:?body=${encodeURIComponent(text)}`}
              className="flex items-center gap-3 rounded-lg border border-primary/10 p-4 hover:bg-primary/5 transition"
            >
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="font-body">SMS</span>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`${coupleNames} Wedding`)}&body=${encodeURIComponent(text)}`}
              className="flex items-center gap-3 rounded-lg border border-primary/10 p-4 hover:bg-primary/5 transition"
            >
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-body">Email</span>
            </a>
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 rounded-lg border border-primary/10 p-4 hover:bg-primary/5 transition text-left"
            >
              {copied ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
              <span className="font-body">{copied ? "Copied!" : "Copy invitation link"}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
