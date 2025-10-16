import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!AUTH_USER || !AUTH_PASSWORD) {
  throw new Error("Missing BASIC_AUTH_USER or BASIC_AUTH_PASSWORD");
}

const ENFORCE_BASIC_AUTH = true;

export async function middleware(request: NextRequest) {
  const authRequiredResponse = await basicAuthCheck(request);

  const response = authRequiredResponse ?? NextResponse.next();

  response.headers.set("x-pathname", request.nextUrl.pathname);
  response.headers.set("x-href", request.nextUrl.href);

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

  const failBasicAuth = authHeader !== expectedAuth;
  const isAuthBasicRoute = pathname.startsWith("/auth/basic");

  if (isAuthBasicRoute && !failBasicAuth) {
    const next = NextResponse.next();
    next.cookies.set("x-site-auth", "true", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    return next;
  }

  if (failBasicAuth && (ENFORCE_BASIC_AUTH || isAuthBasicRoute)) {
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
