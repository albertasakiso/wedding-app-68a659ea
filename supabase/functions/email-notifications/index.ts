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

async function sendBrevoEmail(apiKey: string, to: { email: string; name?: string }, subject: string, htmlContent: string, sender: { name: string; email: string }, replyTo?: string | null) {
  const payload: Record<string, unknown> = {
    sender: { name: sender.name, email: sender.email },
    to: [{ email: to.email, name: to.name || to.email }],
    subject,
    htmlContent,
  };
  if (replyTo) payload.replyTo = { email: replyTo };
  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return resp.json();
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <div style="font-size:24px;color:#8B7355;letter-spacing:2px;">💍</div>
  </div>
  ${body}
  <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e8e0d4;">
    <p style="color:#999;font-size:12px;">Albert & Ruby Wedding</p>
  </div>
</div>
</body>
</html>`;
}

function replaceVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), val || "");
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
  if (!BREVO_API_KEY) {
    return json({ error: "Brevo API key not configured" }, 500);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { action, ...params } = body;

    // Get email settings
    const { data: settings } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .single();

    const sender = {
      name: settings?.sender_name || "Albert & Ruby Wedding",
      email: settings?.sender_email || "noreply@wedding.com",
    };
    const adminEmail = settings?.admin_email;

    switch (action) {
      case "send-rsvp-confirmation": {
        if (!settings?.rsvp_notification_enabled) return json({ skipped: true });
        if (!params.guest_email) return json({ skipped: true, reason: "no email" });

        // Wedding details for warm context
        const { data: siteSettings } = await supabase.from("site_settings").select("*").limit(1).single();
        const { data: venueInfo } = await supabase.from("venue_info").select("*").limit(1).single();
        const weddingDate = siteSettings?.wedding_date
          ? new Date(siteSettings.wedding_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
          : "our wedding day";
        const venueName = venueInfo?.name || "";
        const venueAddress = venueInfo?.address || "";

        // Build a site URL for CTAs (origin header → settings → fallback)
        const originHeader = req.headers.get("origin") || req.headers.get("referer") || "";
        const siteUrl = (params.site_url || originHeader || (siteSettings as any)?.site_url || "").replace(/\/$/, "");
        const giftsUrl = siteUrl ? `${siteUrl}/gifts` : "/gifts";
        const homeUrl = siteUrl || "/";

        if (params.attending) {
          const customSubject = replaceVars(
            settings?.rsvp_confirmation_subject || "RSVP Confirmation — Albert & Ruby Wedding",
            { guest_name: params.guest_name, attending: "Yes" }
          );
          const customMessage = replaceVars(
            settings?.rsvp_confirmation_message || "Thank you for your RSVP! We can't wait to celebrate with you.",
            { guest_name: params.guest_name, attending: "Yes" }
          );

          const html = wrapHtml(`
            <h1 style="color:#8B7355;font-size:28px;text-align:center;margin-bottom:10px;font-family:Georgia,serif;">Thank you, ${params.guest_name}!</h1>
            <p style="color:#8B7355;font-size:14px;text-align:center;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">Your RSVP is confirmed</p>
            <p style="color:#555;font-size:16px;line-height:1.7;text-align:center;">${customMessage}</p>
            <p style="color:#555;font-size:16px;line-height:1.7;text-align:center;">We can't wait to share this special day with you and look forward to celebrating together.</p>
            <div style="background:#faf8f5;border-radius:10px;padding:24px;margin:28px 0;text-align:center;">
              <p style="color:#8B7355;font-size:18px;margin:0;font-weight:bold;">${weddingDate}</p>
              ${venueName ? `<p style="color:#8B7355;font-size:15px;margin:10px 0 0;">${venueName}${venueAddress ? `<br><span style="color:#a89680;font-size:13px;">${venueAddress}</span>` : ""}</p>` : ""}
              ${params.plus_one_name ? `<p style="color:#a89680;font-size:13px;margin:14px 0 0;">Plus one: <strong>${params.plus_one_name}</strong></p>` : ""}
            </div>
            <div style="background:#faf8f5;border-radius:10px;padding:24px;margin:28px 0;">
              <p style="color:#8B7355;font-size:15px;line-height:1.7;margin:0 0 10px;text-align:center;font-weight:bold;">Want to bless us with a gift?</p>
              <p style="color:#555;font-size:14px;line-height:1.7;margin:0;text-align:center;">
                Your presence is the greatest gift, but if you'd like to contribute towards our new beginning, you can send a gift via MTN MoMo, Telecel Cash or GCB transfer — full details are on our gift page.
              </p>
              <div style="text-align:center;margin-top:18px;">
                <a href="${giftsUrl}" style="display:inline-block;background:#8B7355;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;letter-spacing:1px;">Support the Couple</a>
              </div>
            </div>
            <div style="text-align:center;margin:30px 0;">
              <a href="${homeUrl}" style="display:inline-block;border:1px solid #8B7355;color:#8B7355;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;letter-spacing:1px;">Visit Our Wedding Site</a>
            </div>
            <p style="color:#999;font-size:13px;text-align:center;font-style:italic;margin-top:24px;">With love,<br>Albert &amp; Ruby</p>
          `);

          await sendBrevoEmail(BREVO_API_KEY, { email: params.guest_email, name: params.guest_name }, customSubject, html, sender, settings?.sender_reply_to);
          return json({ sent: true, variant: "attending" });
        }

        // Not attending — warm, understanding, gentle gift nudge
        const subject = "We'll miss you — Albert & Ruby";
        const html = wrapHtml(`
          <h1 style="color:#8B7355;font-size:28px;text-align:center;margin-bottom:10px;font-family:Georgia,serif;">We'll miss you, ${params.guest_name}</h1>
          <p style="color:#8B7355;font-size:14px;text-align:center;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">RSVP received</p>
          <p style="color:#555;font-size:16px;line-height:1.7;text-align:center;">
            Thank you for letting us know. We completely understand, and though you won't be with us in person on ${weddingDate}, please know you'll be in our hearts on the day.
          </p>
          <div style="background:#faf8f5;border-radius:10px;padding:24px;margin:28px 0;">
            <p style="color:#8B7355;font-size:15px;line-height:1.7;margin:0;text-align:center;">
              If you'd still like to be part of our celebration, you can send a blessing or contribute a gift through our gift page — MTN MoMo, Telecel Cash and GCB transfer details are all there.
            </p>
            <div style="text-align:center;margin-top:18px;">
              <a href="${giftsUrl}" style="display:inline-block;background:#8B7355;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;letter-spacing:1px;">Send a Gift or Blessing</a>
            </div>
          </div>
          <p style="color:#555;font-size:15px;line-height:1.7;text-align:center;">Thank you for your love and support. It means the world to us.</p>
          <p style="color:#999;font-size:13px;text-align:center;font-style:italic;margin-top:24px;">With love,<br>Albert &amp; Ruby</p>
        `);

        await sendBrevoEmail(BREVO_API_KEY, { email: params.guest_email, name: params.guest_name }, subject, html, sender, settings?.sender_reply_to);
        return json({ sent: true, variant: "not-attending" });
      }

      case "send-rsvp-admin-alert": {
        if (!settings?.rsvp_notification_enabled || !adminEmail) return json({ skipped: true });

        const { count } = await supabase.from("rsvps").select("*", { count: "exact", head: true });

        const html = wrapHtml(`
          <h1 style="color:#8B7355;font-size:24px;text-align:center;">New RSVP Received</h1>
          <div style="background:#faf8f5;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#333;font-size:15px;margin:0;"><strong>${params.guest_name}</strong> has RSVPed.</p>
            <p style="color:#555;font-size:14px;margin:8px 0 0;">Attending: <strong>${params.attending ? "Yes" : "No"}</strong></p>
            ${params.guest_email ? `<p style="color:#555;font-size:14px;margin:8px 0 0;">Email: ${params.guest_email}</p>` : ""}
            ${params.message ? `<p style="color:#555;font-size:14px;margin:8px 0 0;">Message: "${params.message}"</p>` : ""}
          </div>
          <p style="color:#999;font-size:13px;text-align:center;">Total RSVPs: ${count || "?"}</p>
        `);

        await sendBrevoEmail(BREVO_API_KEY, { email: adminEmail }, `New RSVP: ${params.guest_name}`, html, sender, settings?.sender_reply_to);
        return json({ sent: true });
      }

      case "send-gift-thankyou": {
        if (!settings?.gift_notification_enabled) return json({ skipped: true });
        if (!params.donor_email) return json({ skipped: true, reason: "no email" });

        const vars = { donor_name: params.donor_name, amount: params.amount, currency: params.currency, gift_title: params.gift_title };
        const customSubject = replaceVars(settings?.gift_thankyou_subject || "Thank You for Your Gift! — Albert & Ruby", vars);
        const customMessage = replaceVars(settings?.gift_thankyou_message || "Your generous contribution means the world to us.", vars);

        const html = wrapHtml(`
          <h1 style="color:#8B7355;font-size:28px;text-align:center;margin-bottom:20px;">Thank You, ${params.donor_name}!</h1>
          <p style="color:#555;font-size:16px;line-height:1.6;text-align:center;">${customMessage} 💕</p>
          <div style="background:#faf8f5;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#8B7355;font-size:14px;margin:0;"><strong>Gift:</strong> ${params.gift_title}</p>
            <p style="color:#8B7355;font-size:14px;margin:8px 0 0;"><strong>Amount:</strong> ${params.currency} ${params.amount}</p>
          </div>
        `);

        await sendBrevoEmail(BREVO_API_KEY, { email: params.donor_email, name: params.donor_name }, customSubject, html, sender, settings?.sender_reply_to);
        return json({ sent: true });
      }

      case "send-gift-admin-alert": {
        if (!settings?.gift_notification_enabled || !adminEmail) return json({ skipped: true });

        const html = wrapHtml(`
          <h1 style="color:#8B7355;font-size:24px;text-align:center;">New Gift Contribution</h1>
          <div style="background:#faf8f5;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#333;font-size:15px;margin:0;"><strong>${params.donor_name}</strong> contributed <strong>${params.currency} ${params.amount}</strong></p>
            <p style="color:#555;font-size:14px;margin:8px 0 0;">Gift: ${params.gift_title}</p>
            <p style="color:#555;font-size:14px;margin:8px 0 0;">Provider: ${params.payment_provider}</p>
            ${params.donor_email ? `<p style="color:#555;font-size:14px;margin:8px 0 0;">Email: ${params.donor_email}</p>` : ""}
          </div>
        `);

        await sendBrevoEmail(BREVO_API_KEY, { email: adminEmail }, `Gift: ${params.currency} ${params.amount} from ${params.donor_name}`, html, sender, settings?.sender_reply_to);
        return json({ sent: true });
      }

      case "send-rsvp-reminder": {
        if (!params.guests || !Array.isArray(params.guests)) return json({ error: "No guests provided" }, 400);

        // Get wedding details
        const { data: siteSettings } = await supabase.from("site_settings").select("*").limit(1).single();
        const { data: venueInfo } = await supabase.from("venue_info").select("*").limit(1).single();

        const weddingDate = siteSettings?.wedding_date
          ? new Date(siteSettings.wedding_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
          : "TBD";
        const venueName = venueInfo?.name || "TBD";
        const venueAddress = venueInfo?.address || "";

        let sentCount = 0;
        for (const guest of params.guests) {
          if (!guest.guest_email) continue;

          const vars = { guest_name: guest.guest_name, wedding_date: weddingDate, venue_name: venueName, venue_address: venueAddress };
          const subject = replaceVars(settings?.rsvp_reminder_subject || "Reminder: Albert & Ruby Wedding is Coming!", vars);
          const message = replaceVars(settings?.rsvp_reminder_message || "Just a friendly reminder that our wedding is coming up soon.", vars);

          const html = wrapHtml(`
            <h1 style="color:#8B7355;font-size:28px;text-align:center;margin-bottom:20px;">Dear ${guest.guest_name},</h1>
            <p style="color:#555;font-size:16px;line-height:1.6;text-align:center;">${message}</p>
            <div style="background:#faf8f5;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
              <p style="color:#8B7355;font-size:18px;margin:0;font-weight:bold;">📅 ${weddingDate}</p>
              <p style="color:#8B7355;font-size:14px;margin:10px 0 0;">📍 ${venueName}${venueAddress ? `, ${venueAddress}` : ""}</p>
            </div>
          `);

          try {
            await sendBrevoEmail(BREVO_API_KEY, { email: guest.guest_email, name: guest.guest_name }, subject, html, sender, settings?.sender_reply_to);
            sentCount++;
          } catch (e) {
            console.error(`Failed to send reminder to ${guest.guest_email}:`, e);
          }
        }

        return json({ sent: true, sent_count: sentCount });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
