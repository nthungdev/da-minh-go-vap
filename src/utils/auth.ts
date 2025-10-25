import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!AUTH_USER || !AUTH_PASSWORD) {
  throw new Error("Missing BASIC_AUTH_USER or BASIC_AUTH_PASSWORD");
}

/**
 * @returns true if passes verification, else false
 */
export function verifyHttpBasicAuth(authorizationHeader: string) {
  // Expected format: "Basic base64encoded(user:pass)"
  const expectedAuth =
    "Basic " + Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64");

  return authorizationHeader === expectedAuth;
}

/** Redirect to /auth/basic route if authentication is required */
export async function basicAuthGuard() {
  const requestHeaders = await headers();
  const href = requestHeaders.get("x-href");

  if (!href) {
    // x-href header is not being set by the middleware
    throw new Error("Something went wrong");
  }

  const c = await cookies();
  const isAuthorized = c.get("x-site-auth")?.value === "true";

  if (!isAuthorized) {
    // redirects to auth basic page to enter credentials
    const searchParams = new URLSearchParams();
    searchParams.append("nextUrl", href);
    redirect(`/auth/basic?${searchParams.toString()}`);
  }
}
