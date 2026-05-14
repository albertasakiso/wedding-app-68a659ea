import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- Token helpers ----------------------------------------------------------
// Legacy single-password token (kept so existing super-admin login still works)
function makeLegacyToken(password: string): string {
  const day = new Date().toISOString().slice(0, 10);
  let hash = 0;
  const str = password + day;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return "admin_" + Math.abs(hash).toString(36);
}

// Per-user token: base64(JSON({user_id, role, exp, sig}))
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function makeUserToken(userId: string, role: string, secret: string): Promise<string> {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12h
  const payload = { uid: userId, role, exp };
  const sig = (await sha256Hex(JSON.stringify(payload) + secret)).slice(0, 24);
  return "u_" + btoa(JSON.stringify({ ...payload, sig }));
}

async function verifyUserToken(token: string, secret: string): Promise<{ uid: string; role: string } | null> {
  if (!token?.startsWith("u_")) return null;
  try {
    const obj = JSON.parse(atob(token.slice(2)));
    if (!obj?.uid || !obj?.role || !obj?.exp || !obj?.sig) return null;
    if (obj.exp < Date.now()) return null;
    const expectedSig = (await sha256Hex(JSON.stringify({ uid: obj.uid, role: obj.role, exp: obj.exp }) + secret)).slice(0, 24);
    if (expectedSig !== obj.sig) return null;
    return { uid: obj.uid, role: obj.role };
  } catch {
    return null;
  }
}

// Simple SHA-256 password hashing (sufficient for small private wedding admin)
async function hashPassword(pw: string, salt: string): Promise<string> {
  return await sha256Hex(salt + ":" + pw);
}

// Permission table
const ROLE_PERMS: Record<string, Set<string>> = {
  super_admin: new Set(["*"]),
  admin: new Set(["*", "!users"]),
  gift_recorder: new Set([
    "get-dashboard", "list-gift-records", "insert-gift-record", "update-gift-record",
    "delete-gift-record", "list-audit-log", "list-contacts",
    "insert-rsvp", "update-rsvp", "delete-rsvp", "clear-rsvp-message",
    "bulk-delete-rsvp", "bulk-clear-rsvp-messages",
  ]),
  viewer: new Set([
    "get-dashboard", "list-gift-records", "list-audit-log", "list-contacts", "list-users",
  ]),
};

function canDo(role: string, action: string): boolean {
  const perms = ROLE_PERMS[role];
  if (!perms) return false;
  if (perms.has("!" + actionGroup(action))) return false;
  if (perms.has("*")) return true;
  return perms.has(action);
}
function actionGroup(action: string): string {
  if (action.includes("user")) return "users";
  return action;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!ADMIN_PASSWORD) return json({ error: "Admin password not configured" }, 500);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, SERVICE_KEY);

  try {
    const body = await req.json();
    const { action, token, ...params } = body;

    // ---- LOGIN -----------------------------------------------------------
    if (action === "login") {
      // Try per-user login first (email + password)
      if (params.email && params.password) {
        const { data: user } = await supabase
          .from("admin_users").select("*").eq("email", params.email).eq("is_active", true).maybeSingle();
        if (user) {
          // If user has a password_hash, verify it; else if email is owner@wedding.local, accept ADMIN_PASSWORD and set hash
          let ok = false;
          if (user.password_hash) {
            const candidate = await hashPassword(params.password, user.id);
            ok = candidate === user.password_hash;
          } else if (user.email === "owner@wedding.local" && params.password === ADMIN_PASSWORD) {
            const newHash = await hashPassword(params.password, user.id);
            await supabase.from("admin_users").update({ password_hash: newHash }).eq("id", user.id);
            ok = true;
          }
          if (ok) {
            const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
            const role = roles?.[0]?.role || "viewer";
            const t = await makeUserToken(user.id, role, ADMIN_PASSWORD);
            return json({ token: t, user: { id: user.id, email: user.email, name: user.name, role } });
          }
        }
      }
      // Legacy fallback: single-password (super-admin shortcut)
      if (params.password === ADMIN_PASSWORD) {
        const t = await makeUserToken("00000000-0000-0000-0000-000000000001", "super_admin", ADMIN_PASSWORD);
        return json({ token: t, user: { id: "00000000-0000-0000-0000-000000000001", email: "owner@wedding.local", name: "Wedding Owner", role: "super_admin" } });
      }
      return json({ error: "Invalid credentials" }, 401);
    }

    // ---- AUTH check ------------------------------------------------------
    let actor = await verifyUserToken(token, ADMIN_PASSWORD);
    if (!actor && token === makeLegacyToken(ADMIN_PASSWORD)) {
      actor = { uid: "00000000-0000-0000-0000-000000000001", role: "super_admin" };
    }
    if (!actor) return json({ error: "Unauthorized" }, 401);

    if (!canDo(actor.role, action)) {
      return json({ error: "Forbidden for your role" }, 403);
    }

    // Resolve actor name (for audit)
    let actorName = "Admin";
    {
      const { data: u } = await supabase.from("admin_users").select("name").eq("id", actor.uid).maybeSingle();
      if (u?.name) actorName = u.name;
    }

    // Helper: log gift change with reason via direct insert (no trigger GUC)
    async function writeGiftAudit(
      record_id: string | null,
      actionType: "create" | "update" | "delete",
      reason: string | null,
      before: unknown,
      after: unknown,
    ) {
      await supabase.from("gift_audit_log").insert({
        record_id, action: actionType, reason,
        actor_user_id: actor!.uid, actor_name: actorName, actor_role: actor!.role,
        before, after,
      });
    }

    switch (action) {
      // ============== DASHBOARD ==================================
      case "get-dashboard": {
        const [rsvps, events, venue, photos, siteSettings, emailList, giftOptions, giftPayments, paymentSettings, emailSettings, giftWall, giftRecords] = await Promise.all([
          supabase.from("rsvps").select("*").order("created_at", { ascending: false }),
          supabase.from("events").select("*").order("order_index", { ascending: true }),
          supabase.from("venue_info").select("*").limit(1).single(),
          supabase.from("gallery_photos").select("*").order("created_at", { ascending: false }),
          supabase.from("site_settings").select("*").limit(1).single(),
          supabase.from("email_list").select("*").order("created_at", { ascending: false }),
          supabase.from("gift_options").select("*").order("created_at", { ascending: true }),
          supabase.from("gift_payments").select("*").order("created_at", { ascending: false }),
          supabase.from("payment_settings").select("*").limit(1).single(),
          supabase.from("email_settings").select("*").limit(1).single(),
          supabase.from("gift_wall").select("*").order("created_at", { ascending: false }),
          supabase.from("gift_records").select("*").order("received_at", { ascending: false }),
        ]);
        return json({
          rsvps: rsvps.data || [], events: events.data || [], venue: venue.data || null,
          photos: photos.data || [], settings: siteSettings.data || null,
          email_list: emailList.data || [], gift_options: giftOptions.data || [],
          gift_payments: giftPayments.data || [], payment_settings: paymentSettings.data || null,
          email_settings: emailSettings.data || null, gift_wall: giftWall.data || [],
          gift_records: giftRecords.data || [],
          actor: { ...actor, name: actorName },
        });
      }

      // ============== EXISTING ACTIONS ==========================
      case "delete-rsvp": {
        const { error } = await supabase.from("rsvps").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "insert-rsvp": {
        if (!params.guest_name?.trim()) return json({ error: "Guest name required" }, 400);
        const { error } = await supabase.from("rsvps").insert({
          guest_name: params.guest_name.trim(),
          phone: params.phone?.trim() || null,
          email: params.email?.trim() || null,
          attending: params.attending !== false,
          plus_one_name: params.plus_one_name?.trim() || null,
          message: params.message?.trim() || null,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "update-rsvp": {
        const { id, ...updates } = params;
        const { error } = await supabase.from("rsvps").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "clear-rsvp-message": {
        const { error } = await supabase.from("rsvps").update({ message: null }).eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "bulk-delete-rsvp": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        const { error } = await supabase.from("rsvps").delete().in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, count: params.ids.length });
      }
      case "bulk-clear-rsvp-messages": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        const { error } = await supabase.from("rsvps").update({ message: null }).in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, count: params.ids.length });
      }
      case "bulk-delete-subscriber": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        const { error } = await supabase.from("email_list").delete().in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, count: params.ids.length });
      }
      case "bulk-delete-event": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        const { error } = await supabase.from("events").delete().in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, count: params.ids.length });
      }
      case "bulk-delete-gift": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        const { error } = await supabase.from("gift_options").delete().in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, count: params.ids.length });
      }
      case "bulk-delete-gift-wall": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        const { error } = await supabase.from("gift_wall").delete().in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, count: params.ids.length });
      }
      case "bulk-delete-photo": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        const { data: rows } = await supabase.from("gallery_photos").select("id, url").in("id", params.ids);
        const paths: string[] = [];
        for (const p of rows || []) {
          const parts = (p.url || "").split("/gallery/");
          if (parts.length > 1) paths.push(parts[1]);
        }
        if (paths.length) await supabase.storage.from("gallery").remove(paths);
        const { error } = await supabase.from("gallery_photos").delete().in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, count: params.ids.length });
      }
      case "bulk-delete-gift-record": {
        if (!Array.isArray(params.ids) || !params.ids.length) return json({ error: "ids[] required" }, 400);
        if (!params.reason || !String(params.reason).trim()) return json({ error: "Reason required" }, 400);
        const { data: before } = await supabase.from("gift_records").select("*").in("id", params.ids);
        const { error } = await supabase.from("gift_records").delete().in("id", params.ids);
        if (error) return json({ error: error.message }, 400);
        for (const row of before || []) {
          await writeGiftAudit(row.id, "delete", params.reason, row, null);
        }
        return json({ success: true, count: params.ids.length });
      }
      case "insert-event": {
        const { error } = await supabase.from("events").insert({
          title: params.title, description: params.description, event_time: params.event_time,
          location: params.location, order_index: params.order_index || 0,
          icon: params.icon || "Calendar", highlight_color: params.highlight_color || null,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "update-event": {
        const { id, ...updates } = params;
        const { error } = await supabase.from("events").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "delete-event": {
        const { error } = await supabase.from("events").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "update-venue": {
        const { id, ...updates } = params;
        if (id) { const { error } = await supabase.from("venue_info").update(updates).eq("id", id); if (error) return json({ error: error.message }, 400); }
        else { const { error } = await supabase.from("venue_info").insert(updates); if (error) return json({ error: error.message }, 400); }
        return json({ success: true });
      }
      case "update-settings": {
        const { id, ...updates } = params;
        if (id) { const { error } = await supabase.from("site_settings").update(updates).eq("id", id); if (error) return json({ error: error.message }, 400); }
        else { const { error } = await supabase.from("site_settings").insert(updates); if (error) return json({ error: error.message }, 400); }
        return json({ success: true });
      }
      case "insert-photo": {
        const { error } = await supabase.from("gallery_photos").insert({ url: params.url, caption: params.caption || null, uploaded_by: "admin" });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "delete-photo": {
        const { data: photo } = await supabase.from("gallery_photos").select("url").eq("id", params.id).single();
        if (photo?.url) {
          const urlParts = photo.url.split("/gallery/");
          if (urlParts.length > 1) await supabase.storage.from("gallery").remove([urlParts[1]]);
        }
        const { error } = await supabase.from("gallery_photos").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "add-subscriber": {
        const { error } = await supabase.from("email_list").upsert(
          { name: params.name, email: params.email, phone: params.phone || null, source: params.source || "manual" },
          { onConflict: "email" });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "delete-subscriber": {
        const { error } = await supabase.from("email_list").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "insert-gift": {
        const { error } = await supabase.from("gift_options").insert({
          title: params.title, description: params.description || null,
          target_amount: params.target_amount || 0, image_url: params.image_url || null,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "update-gift": {
        const { id, ...updates } = params;
        const { error } = await supabase.from("gift_options").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "delete-gift": {
        const { error } = await supabase.from("gift_options").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "update-payment-settings": {
        const { id, ...updates } = params;
        if (id) { const { error } = await supabase.from("payment_settings").update(updates).eq("id", id); if (error) return json({ error: error.message }, 400); }
        else { const { error } = await supabase.from("payment_settings").insert(updates); if (error) return json({ error: error.message }, 400); }
        return json({ success: true });
      }
      case "update-email-settings": {
        const { id, ...updates } = params;
        if (id) { const { error } = await supabase.from("email_settings").update(updates).eq("id", id); if (error) return json({ error: error.message }, 400); }
        else { const { error } = await supabase.from("email_settings").insert(updates); if (error) return json({ error: error.message }, 400); }
        return json({ success: true });
      }
      case "verify-brevo-key": {
        const key = Deno.env.get("BREVO_API_KEY");
        if (!key) return json({ ok: false, message: "BREVO_API_KEY secret is not configured" });
        try {
          const r = await fetch("https://api.brevo.com/v3/account", { headers: { "api-key": key, "Accept": "application/json" } });
          const data = await r.json();
          if (!r.ok) return json({ ok: false, message: data?.message || `Brevo returned ${r.status}` });
          return json({ ok: true, email: data?.email, companyName: data?.companyName, plan: data?.plan?.[0]?.type });
        } catch (e) {
          return json({ ok: false, message: (e as Error).message });
        }
      }
      case "send-test-email": {
        const key = Deno.env.get("BREVO_API_KEY");
        if (!key) return json({ ok: false, message: "BREVO_API_KEY secret is not configured" });
        const recipient: string = (params.recipient || "").trim();
        if (!recipient) return json({ ok: false, message: "Recipient email is required" }, 400);

        const { data: s } = await supabase.from("email_settings").select("*").limit(1).maybeSingle();
        const senderEmail = s?.sender_email;
        const senderName = s?.sender_name || "Wedding";
        const replyTo = s?.sender_reply_to || null;
        if (!senderEmail) return json({ ok: false, message: "Sender email not set in settings" });

        const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#fff;padding:40px;">
          <div style="max-width:560px;margin:0 auto;border:1px solid #e8e0d4;border-radius:8px;padding:32px;text-align:center;">
            <h1 style="color:#8B7355;margin:0 0 12px;">Test Email ✓</h1>
            <p style="color:#555;line-height:1.6;">If you can read this, your Brevo configuration is working correctly.</p>
            <p style="color:#999;font-size:13px;margin-top:24px;">From: ${senderName} &lt;${senderEmail}&gt;${replyTo ? `<br/>Reply-To: ${replyTo}` : ""}</p>
            <p style="color:#999;font-size:12px;margin-top:24px;">Sent from your wedding admin · ${new Date().toLocaleString()}</p>
          </div>
        </body></html>`;

        const payload: Record<string, unknown> = {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: recipient }],
          subject: `Test email from ${senderName}`,
          htmlContent: html,
        };
        if (replyTo) payload.replyTo = { email: replyTo };

        try {
          const r = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await r.json();
          if (!r.ok) return json({ ok: false, message: data?.message || `Brevo returned ${r.status}` });
          return json({ ok: true, messageId: data?.messageId });
        } catch (e) {
          return json({ ok: false, message: (e as Error).message });
        }
      }
      case "insert-gift-wall": {
        const { error } = await supabase.from("gift_wall").insert({
          donor_name: params.donor_name, gift_type: params.gift_type || "kind", message: params.message || null,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "update-gift-wall": {
        const { id, ...updates } = params;
        const { error } = await supabase.from("gift_wall").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "delete-gift-wall": {
        const { error } = await supabase.from("gift_wall").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      // ============== UNIFIED GIFT RECORDS ======================
      case "list-gift-records": {
        const { data, error } = await supabase.from("gift_records").select("*").order("received_at", { ascending: false });
        if (error) return json({ error: error.message }, 400);
        return json({ records: data || [] });
      }

      case "insert-gift-record": {
        const payload = {
          donor_type: params.donor_type || "individual",
          donor_name: params.donor_name,
          donor_phone: params.donor_phone || null,
          donor_email: params.donor_email || null,
          gift_type: params.gift_type || "cash",
          amount: params.amount ? Number(params.amount) : null,
          currency: params.currency || "GHS",
          description: params.description || null,
          received_by: params.received_by || actorName,
          received_at: params.received_at || new Date().toISOString(),
          notes: params.notes || null,
          is_visible_on_wall: params.is_visible_on_wall !== false,
          created_by_user_id: actor.uid,
          last_modified_by_user_id: actor.uid,
        };
        const { data, error } = await supabase.from("gift_records").insert(payload).select().single();
        if (error) return json({ error: error.message }, 400);
        await writeGiftAudit(data.id, "create", params.reason || "Initial entry", null, data);
        return json({ success: true, record: data });
      }

      case "update-gift-record": {
        if (!params.reason || !String(params.reason).trim()) {
          return json({ error: "Reason is required for edits" }, 400);
        }
        const { id, reason, ...updates } = params;
        const { data: before } = await supabase.from("gift_records").select("*").eq("id", id).single();
        if (!before) return json({ error: "Record not found" }, 404);
        updates.last_modified_by_user_id = actor.uid;
        const { data: after, error } = await supabase.from("gift_records").update(updates).eq("id", id).select().single();
        if (error) return json({ error: error.message }, 400);
        await writeGiftAudit(id, "update", reason, before, after);
        return json({ success: true, record: after });
      }

      case "delete-gift-record": {
        if (!params.reason || !String(params.reason).trim()) {
          return json({ error: "Reason is required for deletion" }, 400);
        }
        const { data: before } = await supabase.from("gift_records").select("*").eq("id", params.id).single();
        if (!before) return json({ error: "Record not found" }, 404);
        const { error } = await supabase.from("gift_records").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        await writeGiftAudit(params.id, "delete", params.reason, before, null);
        return json({ success: true });
      }

      case "list-audit-log": {
        const { data, error } = await supabase.from("gift_audit_log").select("*").order("created_at", { ascending: false }).limit(500);
        if (error) return json({ error: error.message }, 400);
        return json({ entries: data || [] });
      }

      // ============== USERS / ROLES =============================
      case "list-users": {
        const { data: users } = await supabase.from("admin_users").select("*").order("created_at");
        const { data: roles } = await supabase.from("user_roles").select("*");
        return json({ users: users || [], roles: roles || [] });
      }
      case "invite-user": {
        if (!params.email || !params.name || !params.password || !params.role) {
          return json({ error: "Email, name, password, role required" }, 400);
        }
        const { data: existing } = await supabase.from("admin_users").select("id").eq("email", params.email).maybeSingle();
        if (existing) return json({ error: "User already exists" }, 400);
        const { data: user, error } = await supabase.from("admin_users").insert({
          email: params.email, name: params.name, phone: params.phone || null, is_active: true,
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        const hash = await hashPassword(params.password, user.id);
        await supabase.from("admin_users").update({ password_hash: hash }).eq("id", user.id);
        await supabase.from("user_roles").insert({ user_id: user.id, role: params.role });
        return json({ success: true, user });
      }
      case "update-user-role": {
        await supabase.from("user_roles").delete().eq("user_id", params.user_id);
        await supabase.from("user_roles").insert({ user_id: params.user_id, role: params.role });
        return json({ success: true });
      }
      case "set-user-active": {
        const { error } = await supabase.from("admin_users").update({ is_active: params.is_active }).eq("id", params.user_id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }
      case "reset-user-password": {
        if (!params.password) return json({ error: "Password required" }, 400);
        const hash = await hashPassword(params.password, params.user_id);
        const { error } = await supabase.from("admin_users").update({ password_hash: hash }).eq("id", params.user_id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      // ============== CONTACTS ==================================
      case "list-contacts": {
        const [rsvps, records, wall, msgs, list] = await Promise.all([
          supabase.from("rsvps").select("guest_name, phone, email, attending, checked_in_at, plus_one_name, message, created_at"),
          supabase.from("gift_records").select("donor_name, donor_phone, donor_email, amount, gift_type, description, created_at"),
          supabase.from("gift_wall").select("donor_name, phone, email, gift_type, message, created_at"),
          supabase.from("gift_wall").select("donor_name, phone, email, message, created_at"), // messages live on gift_wall + rsvps
          supabase.from("email_list").select("name, email, phone, source, created_at"),
        ]);
        // Build dedupe map by phone || email || lowercase name
        const contacts = new Map<string, any>();
        const upsert = (key: string, c: any) => {
          if (!key) return;
          const cur = contacts.get(key) || { sources: new Set<string>() };
          contacts.set(key, {
            name: cur.name || c.name,
            phone: cur.phone || c.phone,
            email: cur.email || c.email,
            rsvpd: cur.rsvpd || c.rsvpd || false,
            attending: cur.attending || c.attending || false,
            checked_in: cur.checked_in || c.checked_in || false,
            gave_gift: cur.gave_gift || c.gave_gift || false,
            gift_total: (cur.gift_total || 0) + (c.gift_total || 0),
            gift_summary: [cur.gift_summary, c.gift_summary].filter(Boolean).join("; "),
            messaged: cur.messaged || c.messaged || false,
            last_seen: c.last_seen && (!cur.last_seen || c.last_seen > cur.last_seen) ? c.last_seen : cur.last_seen,
            sources: new Set([...(cur.sources || []), ...(c.sources || [])]),
          });
        };
        const keyOf = (phone?: string | null, email?: string | null, name?: string | null) =>
          (phone && phone.replace(/\D/g, "")) || (email && email.toLowerCase()) || (name && name.toLowerCase().trim()) || "";

        for (const r of rsvps.data || []) {
          upsert(keyOf(r.phone, r.email, r.guest_name), {
            name: r.guest_name, phone: r.phone, email: r.email,
            rsvpd: true, attending: !!r.attending, checked_in: !!r.checked_in_at,
            messaged: !!r.message,
            last_seen: r.created_at, sources: ["rsvp"],
          });
        }
        for (const g of records.data || []) {
          upsert(keyOf(g.donor_phone, g.donor_email, g.donor_name), {
            name: g.donor_name, phone: g.donor_phone, email: g.donor_email,
            gave_gift: true, gift_total: Number(g.amount || 0),
            gift_summary: `${g.gift_type}${g.amount ? ` GH₵${g.amount}` : ""}${g.description ? ` (${g.description})` : ""}`,
            last_seen: g.created_at, sources: ["gift"],
          });
        }
        for (const g of wall.data || []) {
          upsert(keyOf(g.phone, g.email, g.donor_name), {
            name: g.donor_name, phone: g.phone, email: g.email,
            gave_gift: true, gift_summary: g.gift_type,
            messaged: !!g.message,
            last_seen: g.created_at, sources: ["wall"],
          });
        }
        for (const e of list.data || []) {
          upsert(keyOf(e.phone, e.email, e.name), {
            name: e.name, phone: e.phone, email: e.email,
            last_seen: e.created_at, sources: [e.source || "subscriber"],
          });
        }

        const out = Array.from(contacts.values()).map((c) => ({ ...c, sources: Array.from(c.sources) }));
        out.sort((a, b) => (b.last_seen || "").localeCompare(a.last_seen || ""));
        return json({ contacts: out });
      }

      // ============== CHECK-IN ==================================
      case "check-in-guest": {
        // Match by phone (preferred) or name
        const phone = (params.phone || "").replace(/\D/g, "");
        let q = supabase.from("rsvps").select("*").eq("attending", true);
        if (phone) {
          // Postgres regex on digits
          const { data: matches } = await supabase.from("rsvps").select("*").eq("attending", true);
          const m = (matches || []).find((r: any) => (r.phone || "").replace(/\D/g, "").endsWith(phone.slice(-7)));
          if (!m) return json({ error: "No RSVP found for that phone" }, 404);
          if (m.checked_in_at) return json({ alreadyCheckedIn: true, guest: m });
          const { error } = await supabase.from("rsvps").update({
            checked_in_at: new Date().toISOString(), checked_in_by: actorName,
          }).eq("id", m.id);
          if (error) return json({ error: error.message }, 400);
          return json({ success: true, guest: { ...m, checked_in_at: new Date().toISOString() } });
        }
        return json({ error: "Phone required" }, 400);
      }

      case "list-check-ins": {
        const { data, error } = await supabase.from("rsvps").select("guest_name, phone, checked_in_at, checked_in_by")
          .not("checked_in_at", "is", null).order("checked_in_at", { ascending: false });
        if (error) return json({ error: error.message }, 400);
        return json({ checkins: data || [] });
      }

      default:
        return json({ error: "Unknown action: " + action }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
