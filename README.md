# AHA Stack

Baseline app: **Next.js 16** (App Router), **Tailwind CSS v4**, **Supabase** (Auth + Postgres + RLS), and **Stripe Checkout** with **verified webhooks**. Use it as a clean Git starting point for products that take payments.

## Quick start

1. Copy environment template and fill in values:

   ```bash
   cp .env.example .env.local
   ```

2. Create a Supabase project, then add **URL**, **anon key**, and (for webhooks writing to `payments`) **service role** key.

3. Run the SQL in `supabase/migrations/` in the Supabase SQL editor (or use the Supabase CLI with `supabase db push`).

4. In Stripe: create a **Product** and **Price**, add **API keys** and (for production) a **webhook** endpoint pointing to  
   `https://your-domain.com/api/webhooks/stripe`  
   listening for `checkout.session.completed`.

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

6. In Supabase **Authentication → URL configuration**, set **Site URL** and **Redirect URLs** to match `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000` and your production URL).

## What you get

- **Auth**: Magic-link sign-in (no passwords in this repo). Session refresh via middleware.
- **Payments**: `POST /api/checkout` creates a Stripe Checkout Session for the signed-in user; success/cancel return to `/account`.
- **Webhooks**: `POST /api/webhooks/stripe` verifies `Stripe-Signature` and (if `SUPABASE_SERVICE_ROLE_KEY` is set) upserts into `payments`.
- **Database**: `profiles` (RLS) + trigger on `auth.users`; `payments` readable only by the owning user via RLS; writes from the app use the service role only in the webhook handler.

## Security and PCI scope

- **Do not** send full card numbers or CVC through your server. This template uses **Stripe Checkout**, so card data stays on Stripe-hosted pages — typically **PCI SAQ A** style scope for your app (confirm with Stripe/your QSA).
- **PayPal** via Stripe: enable **PayPal** under [Stripe Dashboard → Settings → Payment methods](https://dashboard.stripe.com/settings/payment_methods). Optional: set `payment_method_types` on the Checkout Session (e.g. `card`, `paypal`) once your account supports them.
- Keep **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, and **`SUPABASE_SERVICE_ROLE_KEY`** server-only; never prefix them with `NEXT_PUBLIC_`.
- Rotate keys if leaked; use **live** vs **test** keys per environment.
- The webhook handler uses the **raw request body** and `constructEvent` — required for signature verification.

## Note on Next.js 16

The build may warn that the `middleware` convention is deprecated in favor of **proxy**. When you upgrade workflows, follow the [Next.js middleware → proxy migration](https://nextjs.org/docs/messages/middleware-to-proxy).

## License

Private / your choice when you publish the repo.
