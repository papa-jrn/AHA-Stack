import type { APIRoute } from "astro";
import { getPublicEnv } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/security";
import { createServer } from "@/lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOriginRequest(request)) {
    return new Response(
      '<p class="text-sm text-red-600">Invalid request origin.</p>',
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  let siteUrl: string;
  try {
    siteUrl = getPublicEnv().PUBLIC_SITE_URL;
  } catch {
    return new Response(
      '<p class="text-sm text-red-600">Server configuration error.</p>',
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  if (!email) {
    return new Response('<p class="text-sm text-red-600">Email is required.</p>', {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createServer(cookies);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return new Response(
      `<p class="text-sm text-red-600">${escapeHtml(error.message)}</p>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  return new Response(
    '<p class="text-sm text-zinc-600 dark:text-zinc-400">Check your email for the sign-in link.</p>',
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
