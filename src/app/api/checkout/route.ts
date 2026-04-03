import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  let env: ReturnType<typeof getCheckoutEnv>;
  try {
    env = getCheckoutEnv();
  } catch {
    return NextResponse.json(
      { error: "Server is not configured for checkout" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/account?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/account?checkout=cancel`,
    metadata: { supabase_user_id: user.id },
    // Payment methods (card, PayPal, Link, …) follow Stripe Dashboard → Settings → Payment methods
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
