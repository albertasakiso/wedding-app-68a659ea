import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "admin_token";

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
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

export async function adminLogin(password: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("admin-api", {
    body: { action: "login", password },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  setAdminToken(data.token);
  return data.token;
}
