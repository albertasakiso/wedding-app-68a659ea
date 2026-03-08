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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "get-gifts": {
        const { data: gifts } = await supabase
          .from("gift_options")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        const { data: payments } = await supabase
          .from("gift_payments")
          .select("gift_option_id, amount")
          .eq("status", "completed");

        const totals: Record<string, number> = {};
        (payments || []).forEach((p: any) => {
          totals[p.gift_option_id] = (totals[p.gift_option_id] || 0) + Number(p.amount);
        });

        const { data: settings } = await supabase
          .from("payment_settings")
          .select("paystack_public_key, momo_enabled, card_enabled, bank_enabled, currency, stripe_public_key")
          .limit(1)
          .single();

        return json({
          gifts: (gifts || []).map((g: any) => ({
            ...g,
            collected: totals[g.id] || 0,
          })),
          settings: settings || null,
        });
      }

      case "initialize-paystack": {
        const { data: settings } = await supabase
          .from("payment_settings")
          .select("paystack_secret_key, currency")
          .limit(1)
          .single();

        if (!settings?.paystack_secret_key) {
          return json({ error: "Paystack not configured" }, 400);
        }

        // Create gift_payment record first
        const { data: payment, error: insertErr } = await supabase
          .from("gift_payments")
          .insert({
            gift_option_id: params.gift_option_id,
            donor_name: params.donor_name,
            donor_email: params.donor_email || null,
            donor_phone: params.donor_phone || null,
            amount: params.amount,
            currency: settings.currency || "GHS",
            payment_method: params.payment_method || "card",
            payment_provider: "paystack",
            status: "pending",
          })
          .select("id")
          .single();

        if (insertErr) return json({ error: insertErr.message }, 400);

        const amountInPesewas = Math.round(Number(params.amount) * 100);
        const paystackBody: any = {
          email: params.donor_email || `${payment.id}@gift.local`,
          amount: amountInPesewas,
          currency: settings.currency || "GHS",
          reference: payment.id,
          callback_url: params.callback_url,
          metadata: {
            gift_option_id: params.gift_option_id,
            donor_name: params.donor_name,
            payment_id: payment.id,
          },
        };

        if (params.payment_method === "momo" && params.donor_phone) {
          paystackBody.channels = ["mobile_money"];
        } else if (params.payment_method === "bank") {
          paystackBody.channels = ["bank", "bank_transfer"];
        } else {
          paystackBody.channels = ["card"];
        }

        const resp = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.paystack_secret_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paystackBody),
        });

        const result = await resp.json();
        if (!result.status) {
          // Clean up pending payment
          await supabase.from("gift_payments").delete().eq("id", payment.id);
          return json({ error: result.message || "Paystack error" }, 400);
        }

        // Save reference
        await supabase
          .from("gift_payments")
          .update({ payment_reference: result.data.reference })
          .eq("id", payment.id);

        return json({ authorization_url: result.data.authorization_url, reference: result.data.reference });
      }

      case "verify-paystack": {
        const { data: settings } = await supabase
          .from("payment_settings")
          .select("paystack_secret_key")
          .limit(1)
          .single();

        if (!settings?.paystack_secret_key) {
          return json({ error: "Paystack not configured" }, 400);
        }

        const resp = await fetch(`https://api.paystack.co/transaction/verify/${params.reference}`, {
          headers: { Authorization: `Bearer ${settings.paystack_secret_key}` },
        });

        const result = await resp.json();
        const status = result.data?.status === "success" ? "completed" : "failed";

        await supabase
          .from("gift_payments")
          .update({ status, payment_reference: params.reference })
          .eq("id", params.reference);

        // Send email notifications on success
        if (status === "completed") {
          const { data: paymentRec } = await supabase.from("gift_payments").select("*, gift_options(title)").eq("id", params.reference).single();
          if (paymentRec) {
            const emailBase = { donor_name: paymentRec.donor_name, donor_email: paymentRec.donor_email, amount: paymentRec.amount, currency: paymentRec.currency, gift_title: paymentRec.gift_options?.title || "Gift", payment_provider: "paystack" };
            fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/email-notifications`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` }, body: JSON.stringify({ action: "send-gift-thankyou", ...emailBase }) }).catch(() => {});
            fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/email-notifications`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` }, body: JSON.stringify({ action: "send-gift-admin-alert", ...emailBase }) }).catch(() => {});
          }
        }

        return json({ status, verified: status === "completed" });
      }

      case "create-stripe-session": {
        const { data: settings } = await supabase
          .from("payment_settings")
          .select("stripe_secret_key, currency")
          .limit(1)
          .single();

        if (!settings?.stripe_secret_key) {
          return json({ error: "Stripe not configured" }, 400);
        }

        // Create gift_payment record
        const { data: payment, error: insertErr } = await supabase
          .from("gift_payments")
          .insert({
            gift_option_id: params.gift_option_id,
            donor_name: params.donor_name,
            donor_email: params.donor_email || null,
            donor_phone: params.donor_phone || null,
            amount: params.amount,
            currency: settings.currency || "GHS",
            payment_method: "card",
            payment_provider: "stripe",
            status: "pending",
          })
          .select("id")
          .single();

        if (insertErr) return json({ error: insertErr.message }, 400);

        const amountInCents = Math.round(Number(params.amount) * 100);
        const stripeParams = new URLSearchParams();
        stripeParams.append("mode", "payment");
        stripeParams.append("success_url", `${params.callback_url}?verify=stripe&session_id={CHECKOUT_SESSION_ID}`);
        stripeParams.append("cancel_url", params.callback_url);
        stripeParams.append("line_items[0][price_data][currency]", (settings.currency || "GHS").toLowerCase());
        stripeParams.append("line_items[0][price_data][unit_amount]", String(amountInCents));
        stripeParams.append("line_items[0][price_data][product_data][name]", params.gift_title || "Wedding Gift");
        stripeParams.append("line_items[0][quantity]", "1");
        stripeParams.append("metadata[payment_id]", payment.id);
        stripeParams.append("metadata[gift_option_id]", params.gift_option_id);
        if (params.donor_email) {
          stripeParams.append("customer_email", params.donor_email);
        }

        const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(settings.stripe_secret_key + ":")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: stripeParams.toString(),
        });

        const session = await resp.json();
        if (session.error) {
          await supabase.from("gift_payments").delete().eq("id", payment.id);
          return json({ error: session.error.message }, 400);
        }

        await supabase
          .from("gift_payments")
          .update({ payment_reference: session.id })
          .eq("id", payment.id);

        return json({ url: session.url, session_id: session.id });
      }

      case "verify-stripe": {
        const { data: settings } = await supabase
          .from("payment_settings")
          .select("stripe_secret_key")
          .limit(1)
          .single();

        if (!settings?.stripe_secret_key) {
          return json({ error: "Stripe not configured" }, 400);
        }

        const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${params.session_id}`, {
          headers: { Authorization: `Basic ${btoa(settings.stripe_secret_key + ":")}` },
        });

        const session = await resp.json();
        const paymentId = session.metadata?.payment_id;
        const status = session.payment_status === "paid" ? "completed" : "failed";

        if (paymentId) {
          await supabase
            .from("gift_payments")
            .update({ status, payment_reference: session.id })
            .eq("id", paymentId);
        }

        return json({ status, verified: status === "completed" });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
