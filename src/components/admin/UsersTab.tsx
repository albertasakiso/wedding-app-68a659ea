import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, KeyRound } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "super_admin",   label: "Super Admin", desc: "Full access incl. user management" },
  { value: "admin",         label: "Admin",       desc: "Full access except user management" },
  { value: "gift_recorder", label: "Gift Recorder", desc: "Only Gifts tab (record/edit own)" },
  { value: "viewer",        label: "Viewer",      desc: "Read-only access" },
];

interface User { id: string; email: string; name: string; phone: string | null; is_active: boolean; created_at: string; }
interface UserRole { user_id: string; role: string; }

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", phone: "", password: "", role: "gift_recorder" });
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");

  const refresh = async () => {
    try {
      const r = await adminApi("list-users");
      setUsers(r.users || []);
      setRoles(r.roles || []);
    } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { refresh(); }, []);

  const roleOf = (uid: string) => roles.find((r) => r.user_id === uid)?.role || "viewer";

  const submit = async () => {
    if (!form.email || !form.name || !form.password) return toast.error("All fields required");
    try {
      await adminApi("invite-user", form);
      toast.success("User created");
      setOpen(false);
      setForm({ email: "", name: "", phone: "", password: "", role: "gift_recorder" });
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const changeRole = async (uid: string, role: string) => {
    try {
      await adminApi("update-user-role", { user_id: uid, role });
      toast.success("Role updated");
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleActive = async (u: User) => {
    try {
      await adminApi("set-user-active", { user_id: u.id, is_active: !u.is_active });
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const resetPw = async () => {
    if (!resetUserId || !newPw) return;
    try {
      await adminApi("reset-user-password", { user_id: resetUserId, password: newPw });
      toast.success("Password reset");
      setResetUserId(null); setNewPw("");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display text-lg">Team & Roles</h3>
          <p className="text-sm text-muted-foreground">Invite people who help run the wedding. Assign limited roles.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Invite User</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Initial Password *</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Share securely with the user" /></div>
              <div>
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLE_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label} — <span className="text-muted-foreground text-xs">{r.desc}</span></SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={submit} className="w-full">Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-sm">{u.email}</TableCell>
              <TableCell>
                <Select value={roleOf(u.id)} onValueChange={(v) => changeRole(u.id, v)} disabled={u.email === "owner@wedding.local"}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLE_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </TableCell>
              <TableCell><Switch checked={u.is_active} onCheckedChange={() => toggleActive(u)} disabled={u.email === "owner@wedding.local"} /></TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setResetUserId(u.id); setNewPw(""); }} className="gap-1"><KeyRound className="h-3 w-3" /> Reset PW</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!resetUserId} onOpenChange={(v) => !v && setResetUserId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="text" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" />
            <Button onClick={resetPw} className="w-full">Set Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
