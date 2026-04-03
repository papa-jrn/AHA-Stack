import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAndRedirect } from "./actions";
import { CheckoutButton } from "./checkout-button";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as{" "}
        <span className="font-medium text-foreground">{user.email}</span>
      </p>
      {params.checkout === "success" ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Payment completed. Thank you.
        </p>
      ) : null}
      {params.checkout === "cancel" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          Checkout canceled — no charge was made.
        </p>
      ) : null}
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-zinc-500">Billing</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            One-time test payment via Stripe Checkout (cards; enable PayPal in
            the Stripe Dashboard if you want it).
          </p>
          <CheckoutButton className="mt-3" />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form action={signOutAndRedirect}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
        <Link
          href="/"
          className="text-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:text-left"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
