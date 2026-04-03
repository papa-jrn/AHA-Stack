import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getServiceRoleKey, getWebhookEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  let webhookSecret: string;
  try {
    webhookSecret = getWebhookEnv().STRIPE_WEBHOOK_SECRET;
  } catch {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabaseUserId = session.metadata?.supabase_user_id ?? null;
    const serviceKey = getServiceRoleKey();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

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

  return NextResponse.json({ received: true });
}
