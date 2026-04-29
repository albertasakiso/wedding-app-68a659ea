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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";

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

interface GiftWallEntry {
  id: string;
  donor_name: string;
  gift_type: string;
  message: string | null;
  is_visible: boolean;
  created_at: string;
}

interface GiftsTabProps {
  gifts: GiftOption[];
  payments: GiftPayment[];
  giftWall: GiftWallEntry[];
  onRefresh: () => void;
}

export default function GiftsTab({ gifts, payments, giftWall, onRefresh }: GiftsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editGift, setEditGift] = useState<GiftOption | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Gift wall form
  const [isWallAddOpen, setIsWallAddOpen] = useState(false);
  const [wallDonorName, setWallDonorName] = useState("");
  const [wallGiftType, setWallGiftType] = useState("kind");
  const [wallMessage, setWallMessage] = useState("");

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
          id: editGift.id, title, description: description || null,
          target_amount: Number(targetAmount) || 0, image_url: imageUrl || null,
        });
        toast.success("Gift updated");
      } else {
        await adminApi("insert-gift", {
          title, description: description || null,
          target_amount: Number(targetAmount) || 0, image_url: imageUrl || null,
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

  // Gift wall handlers
  const handleAddWallEntry = async () => {
    if (!wallDonorName.trim()) return toast.error("Donor name required");
    try {
      await adminApi("insert-gift-wall", {
        donor_name: wallDonorName,
        gift_type: wallGiftType,
        message: wallMessage || null,
      });
      toast.success("Gift wall entry added");
      setWallDonorName("");
      setWallGiftType("kind");
      setWallMessage("");
      setIsWallAddOpen(false);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleWallVisibility = async (entry: GiftWallEntry) => {
    try {
      await adminApi("update-gift-wall", { id: entry.id, is_visible: !entry.is_visible });
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteWallEntry = async (id: string) => {
    if (!confirm("Delete this gift wall entry?")) return;
    try {
      await adminApi("delete-gift-wall", { id });
      toast.success("Deleted");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const giftTotals: Record<string, number> = {};
  completedPayments.forEach((p) => {
    giftTotals[p.gift_option_id] = (giftTotals[p.gift_option_id] || 0) + Number(p.amount);
  });

  const giftTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; cls: string }> = {
      momo: { label: "MoMo", cls: "bg-yellow-100 text-yellow-800" },
      bank: { label: "Bank", cls: "bg-blue-100 text-blue-800" },
      cash: { label: "Cash", cls: "bg-green-100 text-green-700" },
      physical: { label: "Physical Gift", cls: "bg-purple-100 text-purple-800" },
      kind: { label: "In Kind", cls: "bg-indigo-100 text-indigo-700" },
      both: { label: "Cash & Kind", cls: "bg-pink-100 text-pink-700" },
    };
    const s = styles[type] || styles.cash;
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
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
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Gift Wall Entries</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{giftWall.length}</p></CardContent>
        </Card>
      </div>

      {/* Gift Registry */}
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg text-foreground">Gift Registry</h3>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground"><Plus className="h-4 w-4" /> Add Gift</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editGift ? "Edit Gift" : "Add Gift"}</DialogTitle></DialogHeader>
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
              <TableCell><Switch checked={gift.is_active} onCheckedChange={() => handleToggle(gift)} /></TableCell>
              <TableCell className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(gift)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(gift.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Gift Wall Management */}
      <div className="flex justify-between items-center mt-8">
        <h3 className="font-display text-lg text-foreground">Gift Wall</h3>
        <Dialog open={isWallAddOpen} onOpenChange={setIsWallAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground"><Plus className="h-4 w-4" /> Record Physical Gift</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Physical Gift</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div><Label>Donor Name *</Label><Input value={wallDonorName} onChange={(e) => setWallDonorName(e.target.value)} placeholder="Name of donor" /></div>
              <div>
                <Label>Gift Type</Label>
                <Select value={wallGiftType} onValueChange={setWallGiftType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="momo">MoMo</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="physical">Physical Gift</SelectItem>
                    <SelectItem value="kind">In Kind</SelectItem>
                    <SelectItem value="both">Cash & Kind</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Message (optional)</Label><Input value={wallMessage} onChange={(e) => setWallMessage(e.target.value)} placeholder="Optional thank-you note" /></div>
              <Button onClick={handleAddWallEntry} className="w-full bg-primary text-primary-foreground">Add to Gift Wall</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {giftWall.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.donor_name}</TableCell>
              <TableCell>{giftTypeBadge(entry.gift_type)}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{entry.message || "—"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleToggleWallVisibility(entry)}>
                  {entry.is_visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteWallEntry(entry.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {giftWall.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No gift wall entries yet</TableCell></TableRow>
          )}
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
