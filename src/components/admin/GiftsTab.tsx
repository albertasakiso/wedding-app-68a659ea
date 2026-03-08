import { useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Gift, DollarSign } from "lucide-react";

interface GiftOption {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  image_url: string | null;
  is_active: boolean;
}

interface GiftPayment {
  id: string;
  gift_option_id: string;
  donor_name: string;
  donor_email: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_provider: string | null;
  status: string;
  created_at: string;
}

interface GiftsTabProps {
  gifts: GiftOption[];
  payments: GiftPayment[];
  onRefresh: () => void;
}

export default function GiftsTab({ gifts, payments, onRefresh }: GiftsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editGift, setEditGift] = useState<GiftOption | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalCollected = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setImageUrl("");
    setEditGift(null);
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title required");
    try {
      if (editGift) {
        await adminApi("update-gift", {
          id: editGift.id,
          title,
          description: description || null,
          target_amount: Number(targetAmount) || 0,
          image_url: imageUrl || null,
        });
        toast.success("Gift updated");
      } else {
        await adminApi("insert-gift", {
          title,
          description: description || null,
          target_amount: Number(targetAmount) || 0,
          image_url: imageUrl || null,
        });
        toast.success("Gift added");
      }
      resetForm();
      setIsAddOpen(false);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gift?")) return;
    try {
      await adminApi("delete-gift", { id });
      toast.success("Deleted");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggle = async (gift: GiftOption) => {
    try {
      await adminApi("update-gift", { id: gift.id, is_active: !gift.is_active });
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openEdit = (gift: GiftOption) => {
    setEditGift(gift);
    setTitle(gift.title);
    setDescription(gift.description || "");
    setTargetAmount(String(gift.target_amount));
    setImageUrl(gift.image_url || "");
    setIsAddOpen(true);
  };

  const giftTotals: Record<string, number> = {};
  completedPayments.forEach((p) => {
    giftTotals[p.gift_option_id] = (giftTotals[p.gift_option_id] || 0) + Number(p.amount);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Gifts</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{gifts.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Collected</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">GH₵{totalCollected.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Payments</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{completedPayments.length}</p></CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg text-foreground">Gift Registry</h3>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground"><Plus className="h-4 w-4" /> Add Gift</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editGift ? "Edit Gift" : "Add Gift"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <div><Label>Target Amount (GH₵)</Label><Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} /></div>
              <div><Label>Image URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
              <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">{editGift ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Collected</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gifts.map((gift) => (
            <TableRow key={gift.id}>
              <TableCell className="font-medium">{gift.title}</TableCell>
              <TableCell>GH₵{gift.target_amount.toLocaleString()}</TableCell>
              <TableCell className="text-primary font-medium">GH₵{(giftTotals[gift.id] || 0).toLocaleString()}</TableCell>
              <TableCell>
                <Switch checked={gift.is_active} onCheckedChange={() => handleToggle(gift)} />
              </TableCell>
              <TableCell className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(gift)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(gift.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Recent payments */}
      <h3 className="font-display text-lg text-foreground mt-8">Recent Payments</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.slice(0, 50).map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.donor_name}</TableCell>
              <TableCell>{p.currency} {Number(p.amount).toLocaleString()}</TableCell>
              <TableCell>{p.payment_method || "—"}</TableCell>
              <TableCell>{p.payment_provider || "—"}</TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded-full ${p.status === "completed" ? "bg-green-100 text-green-700" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.status}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments yet</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
