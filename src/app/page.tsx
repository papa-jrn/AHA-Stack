import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            AHA Stack
          </span>
          <nav className="flex gap-4 text-sm font-medium">
            <Link
              href="/login"
              className="text-zinc-600 transition hover:text-foreground dark:text-zinc-400"
            >
              Sign in
            </Link>
            <Link
              href="/account"
              className="text-zinc-600 transition hover:text-foreground dark:text-zinc-400"
            >
              Account
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Baseline template
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Next.js, Tailwind, Supabase, Stripe
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Clone this repo for each new project: magic-link auth, Postgres with
          RLS, Stripe Checkout (card and Dashboard-configured wallets like
          PayPal), and webhook verification — without handling raw card data on
          your server.
        </p>
        <ul className="mt-10 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            Supabase Auth + optional profile trigger in SQL
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            Stripe Checkout server route + signed webhooks
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            Security headers and env separation (.env.example committed)
          </li>
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Get started
          </Link>
          <a
            href="https://supabase.com/docs/guides/auth/server-side/nextjs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
          >
            Supabase + Next.js
          </a>
        </div>
      </main>
    </div>
  );
}
