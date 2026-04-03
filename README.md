# AHA Stack

Baseline app: **[Astro](https://astro.build/)** (server output), **[HTMX](https://htmx.org/)**, **Tailwind CSS v4**, **Supabase** (Auth + Postgres + RLS), and **Stripe Checkout** with **verified webhooks**. The name matches **A**stro + **H**TMX + a server/API layer you extend (**A**PI routes).

## Quick start

1. Copy environment template and fill in values:

   ```bash
   cp .env.example .env
   ```

2. Create a Supabase project; add **URL**, **anon key**, and (for webhook → `payments`) **service role** key.

3. Run the SQL in `supabase/migrations/` in the Supabase SQL editor (or `supabase db push`).

4. In Stripe: create a **Product** and **Price**, set **API keys**, and point a **webhook** to  
   `https://your-domain.com/api/webhooks/stripe`  
   for `checkout.session.completed`.

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

6. Supabase **Authentication → URL configuration**: set **Site URL** and **Redirect URLs** to match `PUBLIC_SITE_URL` (e.g. `http://localhost:4321` and production).

## What you get

- **Auth**: Magic-link sign-in; `exchangeCodeForSession` on `/auth/callback`; session refresh in Astro middleware.
- **HTMX**: Login form posts to `/api/auth/login` and swaps the status HTML; checkout uses `HX-Redirect` to Stripe; logout uses `HX-Redirect` home.
- **Payments**: `POST /api/checkout` creates a Checkout Session (JSON for non-HTMX clients, HTML / redirect for HTMX).
- **Webhooks**: `POST /api/webhooks/stripe` verifies signatures and optionally upserts `payments` with the service role.
- **Database**: Same migration as before — `profiles`, `payments`, RLS, auth trigger.

## Production

```bash
npm run build
npm run start
```

Uses the **Node** adapter (`standalone`). Deploy to any Node host, or adapt to your platform’s Astro adapter.

## Security and PCI

- Use **Stripe Checkout** so card data stays on Stripe (typically **SAQ A–style** scope for your app — confirm with Stripe/your QSA).
- **PayPal** and other methods: enable them in the [Stripe Dashboard payment methods](https://dashboard.stripe.com/settings/payment_methods).
- Never commit **`.env`**; keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` server-only (no `PUBLIC_` prefix).

## Environment variables (migration from Next.js)

If you had an older clone using `NEXT_PUBLIC_*`, rename to **`PUBLIC_*`** as in `.env.example` (`PUBLIC_SITE_URL`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`).

## License

Private / your choice when you publish the repo.
