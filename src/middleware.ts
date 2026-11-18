import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestOrigin } from "@/utils/url";
import {
  LOCALE_COOKIE,
  PUBLIC_PAGE_CACHE_CONTROL,
  SITE_AUTH_COOKIE,
  isLocalizedPath,
  matchInternalPrefix,
} from "@/i18n/routing";

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!AUTH_USER || !AUTH_PASSWORD) {
  throw new Error("Missing BASIC_AUTH_USER or BASIC_AUTH_PASSWORD");
}

const ENFORCE_BASIC_AUTH = false;

type BasicAuthResult = "challenge" | "grant" | null;

// save current url to "x-href" so that user can be redirected back after auth flow is done

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const origin = getRequestOrigin(request);

  // `/vi/...`, `/en-auth/...` etc. are internal routes. External requests for
  // them switch the locale cookie (never the site-auth cookie) and redirect to
  // the unprefixed public URL, so each page keeps a single public URL and the
  // auth variants stay behind the cookie check in next.config rewrites.
  const internalPrefix = matchInternalPrefix(pathname);
  if (internalPrefix.kind === "invalid") {
    return new NextResponse("Bad Request", { status: 400 });
  }
  if (internalPrefix.kind === "redirect") {
    // Built from nextUrl, not forwarded headers, so it stays on this host.
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = internalPrefix.pathname;
    const redirect = NextResponse.redirect(redirectUrl, 307);
    redirect.cookies.set(LOCALE_COOKIE, internalPrefix.locale, { path: "/" });
    return redirect;
  }

  const authResult = basicAuthCheck(request);
  if (authResult === "challenge") {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const href = `${origin}${pathname}${search}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-href", href);
  requestHeaders.set("x-origin", origin);

  // The locale rewrite itself happens in next.config (see buildLocaleRewrites).
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (isLocalizedPath(pathname)) {
    // Next only adds its ISR `s-maxage` header when none is set; keep shared
    // caches from storing a page whose locale depends on the cookie.
    response.headers.set("cache-control", PUBLIC_PAGE_CACHE_CONTROL);
  }

  if (authResult === "grant") {
    response.cookies.set(SITE_AUTH_COOKIE, "true", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
  }

  response.headers.set("x-pathname", pathname);
  response.headers.set("x-href", href);
  response.headers.set("x-origin", origin);

  return response;
}

/**
 * @returns "challenge" when credentials are required, "grant" when valid
 * credentials were sent to the auth route, otherwise null
 */
function basicAuthCheck(request: NextRequest): BasicAuthResult {
  const { pathname } = request.nextUrl;

  if (pathname.match(/^\/(admin|api)/)) {
    return null;
  }

  const authHeader = request.headers.get("authorization");

  // Expected format: "Basic base64encoded(user:pass)"
  const expectedAuth =
    "Basic " + Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64");

  const passBasicAuth = authHeader === expectedAuth;
  const isAuthBasicRoute = pathname.startsWith("/auth/basic");

  if (isAuthBasicRoute && passBasicAuth) {
    return "grant";
  }

  if ((ENFORCE_BASIC_AUTH || isAuthBasicRoute) && !passBasicAuth) {
    return "challenge";
  }

  return null;
}

// Everything except API/admin routes and static assets. Exclusions match whole
// segments or exact files: every path the locale rewrite localizes must pass
// through here to get the `private` cache-control (see locale-routing test).
export const config = {
  matcher: [
    {
      source:
        "/((?!(?:api|admin|_next/static|_next/image)(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|manifest\\.webmanifest$).*)",
    },
  ],
};
