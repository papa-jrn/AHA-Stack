import Stripe from "stripe";

let stripe: Stripe | null = null;

function requireStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) {
    throw new Error("STRIPE_SECRET_KEY is missing or invalid");
  }
  return key;
}

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(requireStripeSecretKey(), {
      apiVersion: Stripe.API_VERSION,
      typescript: true,
    });
  }
  return stripe;
}
