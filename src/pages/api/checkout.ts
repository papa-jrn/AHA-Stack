import type { APIRoute } from "astro";
import { getCheckoutEnv } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/security";
import { createServer } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const POST: APIRoute = async ({ request, cookies }) => {
  const isHtmx = request.headers.get("HX-Request") === "true";

  const fail = (html: string, json: { error: string }, status = 503) => {
    if (isHtmx) {
      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return new Response(JSON.stringify(json), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };

  if (!isSameOriginRequest(request)) {
    return fail(
      '<p class="text-sm text-red-600">Invalid request origin.</p>',
      { error: "Invalid request origin" },
      403,
    );
  }

  let env: ReturnType<typeof getCheckoutEnv>;
  try {
    env = getCheckoutEnv();
  } catch {
    return fail(
      '<p class="text-sm text-red-600">Checkout is not configured.</p>',
      { error: "Server is not configured for checkout" },
      503,
    );
  }

  const supabase = createServer(cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail(
      '<p class="text-sm text-red-600">Sign in to continue.</p>',
      { error: "Unauthorized" },
      401,
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${env.PUBLIC_SITE_URL}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.PUBLIC_SITE_URL}/account?checkout=cancel`,
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) {
    return fail(
      '<p class="text-sm text-red-600">Could not start checkout.</p>',
      { error: "Could not create checkout session" },
      500,
    );
  }

  if (isHtmx) {
    return new Response(null, {
      status: 200,
      headers: { "HX-Redirect": session.url },
    });
  }

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
