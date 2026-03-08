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

function makeToken(password: string): string {
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

function verifyToken(token: string, password: string): boolean {
  return token === makeToken(password);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
  if (!ADMIN_PASSWORD) {
    return json({ error: "Admin password not configured" }, 500);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { action, token, ...params } = body;

    if (action === "login") {
      if (params.password === ADMIN_PASSWORD) {
        return json({ token: makeToken(ADMIN_PASSWORD) });
      }
      return json({ error: "Invalid password" }, 401);
    }

    if (!verifyToken(token, ADMIN_PASSWORD)) {
      return json({ error: "Unauthorized" }, 401);
    }

    switch (action) {
      case "get-dashboard": {
        const [rsvps, events, venue, photos, siteSettings, emailList] = await Promise.all([
          supabase.from("rsvps").select("*").order("created_at", { ascending: false }),
          supabase.from("events").select("*").order("order_index", { ascending: true }),
          supabase.from("venue_info").select("*").limit(1).single(),
          supabase.from("gallery_photos").select("*").order("created_at", { ascending: false }),
          supabase.from("site_settings").select("*").limit(1).single(),
          supabase.from("email_list").select("*").order("created_at", { ascending: false }),
        ]);
        return json({
          rsvps: rsvps.data || [],
          events: events.data || [],
          venue: venue.data || null,
          photos: photos.data || [],
          settings: siteSettings.data || null,
          email_list: emailList.data || [],
        });
      }

      case "delete-rsvp": {
        const { error } = await supabase.from("rsvps").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      case "insert-event": {
        const { error } = await supabase.from("events").insert({
          title: params.title,
          description: params.description,
          event_time: params.event_time,
          location: params.location,
          order_index: params.order_index || 0,
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
        if (id) {
          const { error } = await supabase.from("venue_info").update(updates).eq("id", id);
          if (error) return json({ error: error.message }, 400);
        } else {
          const { error } = await supabase.from("venue_info").insert(updates);
          if (error) return json({ error: error.message }, 400);
        }
        return json({ success: true });
      }

      case "update-settings": {
        const { id, ...updates } = params;
        if (id) {
          const { error } = await supabase.from("site_settings").update(updates).eq("id", id);
          if (error) return json({ error: error.message }, 400);
        } else {
          const { error } = await supabase.from("site_settings").insert(updates);
          if (error) return json({ error: error.message }, 400);
        }
        return json({ success: true });
      }

      case "insert-photo": {
        const { error } = await supabase.from("gallery_photos").insert({
          url: params.url,
          caption: params.caption || null,
          uploaded_by: "admin",
        });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      case "delete-photo": {
        const { data: photo } = await supabase
          .from("gallery_photos")
          .select("url")
          .eq("id", params.id)
          .single();
        
        if (photo?.url) {
          const urlParts = photo.url.split("/gallery/");
          if (urlParts.length > 1) {
            await supabase.storage.from("gallery").remove([urlParts[1]]);
          }
        }

        const { error } = await supabase.from("gallery_photos").delete().eq("id", params.id);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
