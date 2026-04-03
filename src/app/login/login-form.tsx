"use client";

import { useState } from "react";
import { signInWithMagicLink } from "./actions";

export function LoginForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        setPending(true);
        setMessage(null);
        const result = await signInWithMagicLink(formData);
        setPending(false);
        if ("error" in result && result.error) {
          setMessage(result.error);
        } else if ("success" in result) {
          setMessage("Check your email for the sign-in link.");
        }
      }}
    >
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-foreground shadow-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Email me a link"}
      </button>
      {message ? (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      ) : null}
    </form>
  );
}
