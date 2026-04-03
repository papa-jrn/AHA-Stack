import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getCheckoutEnv, getServiceRoleKey, getWebhookEnv } from "@/lib/env";
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
    let expectedPriceId: string;

    try {
      expectedPriceId = getCheckoutEnv().STRIPE_PRICE_ID;
    } catch {
      return new Response(JSON.stringify({ error: "Checkout not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      !session.id ||
      !supabaseUserId ||
      session.mode !== "payment" ||
      session.payment_status !== "paid" ||
      session.status !== "complete" ||
      session.client_reference_id !== supabaseUserId
    ) {
      return new Response(JSON.stringify({ error: "Unexpected checkout session" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 10,
    });
    const matchedPrice = lineItems.data.some(
      (item) => item.price?.id === expectedPriceId && item.quantity === 1,
    );

    if (!matchedPrice) {
      return new Response(JSON.stringify({ error: "Unexpected checkout price" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (serviceKey && url) {
      const admin = createClient(url, serviceKey);
      const amountTotal = session.amount_total ?? 0;
      const currency = session.currency ?? "usd";
      const { error } = await admin.from("payments").upsert(
        {
          stripe_checkout_session_id: session.id,
          supabase_user_id: supabaseUserId,
          amount_total: amountTotal,
          currency,
          status: "complete",
        },
        { onConflict: "stripe_checkout_session_id" },
      );

      if (error) {
        return new Response(JSON.stringify({ error: "Could not store payment" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
