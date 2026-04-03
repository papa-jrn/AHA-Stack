import type { APIRoute } from "astro";
import { isSameOriginRequest } from "@/lib/security";
import { createServer } from "@/lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOriginRequest(request)) {
    return new Response(JSON.stringify({ error: "Invalid request origin" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createServer(cookies);
  await supabase.auth.signOut();
  return new Response(null, {
    status: 200,
    headers: { "HX-Redirect": "/" },
  });
};
