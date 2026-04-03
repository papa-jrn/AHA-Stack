"use client";

import { useState } from "react";

export function CheckoutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            const res = await fetch("/api/checkout", { method: "POST" });
            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok) {
              setError(data.error ?? "Checkout failed");
              return;
            }
            if (data.url) {
              window.location.href = data.url;
            }
          } catch {
            setError("Network error");
          } finally {
            setPending(false);
          }
        }}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Redirecting…" : "Pay with Stripe Checkout"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
