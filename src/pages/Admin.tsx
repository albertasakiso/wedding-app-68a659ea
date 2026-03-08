import { useState } from "react";
import { getAdminToken } from "@/lib/admin-api";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(!!getAdminToken());

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthenticated(false)} />;
}
