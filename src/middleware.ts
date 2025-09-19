import { defaultLocale } from "@/i18n/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!AUTH_USER || !AUTH_PASSWORD) {
  throw new Error("Missing BASIC_AUTH_USER or BASIC_AUTH_PASSWORD");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locale = request.cookies.get("locale")?.value || defaultLocale;

  const response = NextResponse.next();
  response.cookies.set("locale", locale);

  if (pathname.match(/^\/(admin|api)/)) {
    return response;
  }

  if (process.env.NODE_ENV === "development") {
    return response;
  }

  const authHeader = request.headers.get("authorization");

  // Expected format: "Basic base64encoded(user:pass)"
  const expectedAuth =
    "Basic " + Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64");

  if (authHeader !== expectedAuth) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return response;
}

// Protect everything except static assets
export const config = {
  matcher: ["/((?!_next/static|favicon.ico|robots.txt).*)"],
};
