import "server-only";

import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { parseRouteSegment } from "@/i18n/routing";

export type LocaleParams = { locale: string };

/**
 * Validates the `[locale]` segment and registers its locale with next-intl so
 * `getLocale()`/`getMessages()` below it don't read request headers, which
 * would opt the route out of static rendering. Call it in every layout and
 * page under `[locale]`.
 */
export function applyRouteLocale(segment: string): Locale {
  const parsed = parseRouteSegment(segment);
  if (!parsed) notFound();
  setRequestLocale(parsed.locale);
  return parsed.locale;
}

/**
 * Sends visitors without the site-auth cookie to `/auth/basic` for content
 * flagged `requireHttpBasicAuth`. Access is decided by the segment the
 * middleware chose, so the page stays statically renderable.
 */
export function requireSiteAuth(segment: string, publicPath: string) {
  if (parseRouteSegment(segment)?.isSiteAuthorized) return;
  const searchParams = new URLSearchParams({ nextUrl: publicPath });
  redirect(`/auth/basic?${searchParams.toString()}`);
}
