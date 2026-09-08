import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestOrigin } from "@/utils/url";

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!AUTH_USER || !AUTH_PASSWORD) {
  throw new Error("Missing BASIC_AUTH_USER or BASIC_AUTH_PASSWORD");
}

const ENFORCE_BASIC_AUTH = false;

// save current url to "x-href" so that user can be redirected back after auth flow is done

export async function middleware(request: NextRequest) {
  const authRequiredResponse = await basicAuthCheck(request);

  const origin = getRequestOrigin(request);
  const href = `${origin}${request.nextUrl.pathname}${request.nextUrl.search}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-href", href);
  requestHeaders.set("x-origin", origin);

  const response =
    authRequiredResponse ??
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  response.headers.set("x-pathname", request.nextUrl.pathname);
  response.headers.set("x-href", href);
  response.headers.set("x-origin", origin);

  return response;
}

/**
 * @returns NextResponse if basic authentication is required
 */
async function basicAuthCheck(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.match(/^\/(admin|api)/)) {
    return null;
  }
  // if (process.env.NODE_ENV === "development") {
  //   return null;
  // }

  const authHeader = request.headers.get("authorization");

  // Expected format: "Basic base64encoded(user:pass)"
  const expectedAuth =
    "Basic " + Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64");

  const passBasicAuth = authHeader === expectedAuth;
  const isAuthBasicRoute = pathname.startsWith("/auth/basic");

  if (isAuthBasicRoute) {
    if (passBasicAuth) {
      const next = NextResponse.next();
      next.cookies.set("x-site-auth", "true", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
      return next;
    }
  }

  if ((ENFORCE_BASIC_AUTH || isAuthBasicRoute) && !passBasicAuth) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return null;
}

// Protect everything except static assets
export const config = {
  matcher: [
    {
      source:
        "/((?!api|admin|_next/static|favicon.ico|robots.txt|sitemap.xml|manifest).*)",
    },
  ],
};
