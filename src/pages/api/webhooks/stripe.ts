import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getServiceRoleKey, getWebhookEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export const POST: APIRoute = async ({ request }) => {
  let webhookSecret: string;
  try {
    webhookSecret = getWebhookEnv().STRIPE_WEBHOOK_SECRET;
  } catch {
    return new Response(JSON.stringify({ error: "Webhook not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabaseUserId = session.metadata?.supabase_user_id ?? null;
    const serviceKey = getServiceRoleKey();
    const url = import.meta.env.PUBLIC_SUPABASE_URL;

    if (serviceKey && url && supabaseUserId && session.id) {
      const admin = createClient(url, serviceKey);
      const amountTotal = session.amount_total ?? 0;
      const currency = session.currency ?? "usd";
      await admin.from("payments").upsert(
        {
          stripe_checkout_session_id: session.id,
          supabase_user_id: supabaseUserId,
          amount_total: amountTotal,
          currency,
          status: "complete",
        },
        { onConflict: "stripe_checkout_session_id" },
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
