import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("pk_")
    .optional(),
});

const stripeSecretSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
});

const checkoutSchema = publicSchema.merge(stripeSecretSchema).extend({
  STRIPE_PRICE_ID: z.string().startsWith("price_"),
});

const webhookSchema = stripeSecretSchema.extend({
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
});

const serviceRoleSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type CheckoutEnv = z.infer<typeof checkoutSchema>;

export function getPublicEnv() {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid public environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }
  return parsed.data;
}

export function getCheckoutEnv(): CheckoutEnv {
  const parsed = checkoutSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Checkout env invalid: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }
  return parsed.data;
}

export function getWebhookEnv() {
  const parsed = webhookSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Stripe webhook env invalid: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }
  return parsed.data;
}

/** Optional: use in webhook to persist events with service role (bypasses RLS). */
export function getServiceRoleKey(): string | null {
  const parsed = serviceRoleSchema.safeParse(process.env);
  return parsed.success ? parsed.data.SUPABASE_SERVICE_ROLE_KEY : null;
}
