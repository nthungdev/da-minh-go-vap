import { headers } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Resolves the public origin (e.g. `https://example.com`) from an incoming HTTP request.
 *
 * Inspects `x-forwarded-host` and `x-forwarded-proto` (standard for reverse proxies
 * and edge platforms like Cloudflare, Vercel, Nginx), falling back to the `host` header
 * or the parsed request URL origin.
 *
 * @param request - NextRequest or standard Request instance.
 * @returns Fully qualified origin string with protocol.
 */
export function getRequestOrigin(request: Request | NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const proto = forwardedProto || "https";
    return `${proto}://${forwardedHost}`;
  }

  const host = request.headers.get("host");
  if (host) {
    const isLocal =
      host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = forwardedProto || (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }

  if ("nextUrl" in request && request.nextUrl?.origin) {
    return request.nextUrl.origin;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }
}

/**
 * Resolves the request origin asynchronously in Server Components or Route Handlers
 * using Next.js `headers()`.
 *
 * Falls back gracefully to `process.env.NEXT_PUBLIC_BASE_URL` or `http://localhost:3000`
 * when called outside of an active request lifecycle (such as during static builds or prerendering).
 *
 * @returns Fully qualified origin string with protocol.
 */
export async function getServerOrigin(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedHost = headerList.get("x-forwarded-host");
    const forwardedProto = headerList.get("x-forwarded-proto");
    const host =
      forwardedHost || headerList.get("host") || headerList.get("x-host");

    if (host) {
      const isLocal =
        host.startsWith("localhost") || host.startsWith("127.0.0.1");
      const proto = forwardedProto || (isLocal ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // Outside active request context (e.g. build-time static generation)
  }

  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}
