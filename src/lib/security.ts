import { getPublicEnv } from "@/lib/env";

export function getTrustedSiteOrigin() {
  return new URL(getPublicEnv().PUBLIC_SITE_URL).origin;
}

export function isSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/account",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(value, "http://localhost");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function isSameOriginRequest(request: Request) {
  const trustedOrigin = getTrustedSiteOrigin();
  const origin = request.headers.get("origin");
  if (origin) {
    return origin === trustedOrigin;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === trustedOrigin;
    } catch {
      return false;
    }
  }

  return false;
}
