import type { APIRoute } from "astro";
import { createServer } from "@/lib/supabase/server";

export const POST: APIRoute = async ({ cookies }) => {
  const supabase = createServer(cookies);
  await supabase.auth.signOut();
  return new Response(null, {
    status: 200,
    headers: { "HX-Redirect": "/" },
  });
};
