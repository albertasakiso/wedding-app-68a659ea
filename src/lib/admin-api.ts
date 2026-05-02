import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "gift_recorder" | "viewer";
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getAdminUser(): AdminUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setAdminUser(user: AdminUser) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function adminApi(action: string, params: Record<string, unknown> = {}) {
  const token = getAdminToken();
  const { data, error } = await supabase.functions.invoke("admin-api", {
    body: { action, token, ...params },
  });
  if (error) throw new Error(error.message || "API error");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function adminLogin(passwordOrEmail: string, password?: string): Promise<AdminUser> {
  // Two modes: legacy password-only OR email + password
  const body = password
    ? { action: "login", email: passwordOrEmail, password }
    : { action: "login", password: passwordOrEmail };
  const { data, error } = await supabase.functions.invoke("admin-api", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  setAdminToken(data.token);
  if (data.user) setAdminUser(data.user);
  return data.user;
}
