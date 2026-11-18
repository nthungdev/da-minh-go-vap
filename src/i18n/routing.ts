import type { Rewrite } from "next/dist/lib/load-custom-routes";
import { defaultLocale, locales, type Locale } from "./config.ts";

/**
 * Public URLs never carry the locale. `next.config` rewrites read it from this
 * cookie and map `/foo` to the internal `/{locale}/foo` route, so each locale
 * is rendered and cached as its own static page.
 */
export const LOCALE_COOKIE = "locale";

/** Set by the middleware once a visitor passes `/auth/basic`. */
export const SITE_AUTH_COOKIE = "x-site-auth";

/**
 * Visitors with the site-auth cookie are rewritten to `/{locale}-auth/...`, a
 * separately cached copy of each page, so pages flagged
 * `requireHttpBasicAuth` can decide access without reading request cookies.
 */
const SITE_AUTH_SEGMENT_SUFFIX = "-auth";

export type RouteSegment = {
  locale: Locale;
  isSiteAuthorized: boolean;
};

/**
 * One public URL serves two locales, so a shared (CDN) cache would hand one
 * visitor's locale to the next. Next's own ISR cache still serves the page.
 */
export const PUBLIC_PAGE_CACHE_CONTROL =
  "private, no-cache, no-store, max-age=0, must-revalidate";

// Paths served outside the `[locale]` segment.
const UNLOCALIZED_SEGMENTS = [
  "_next",
  "api",
  "admin",
  "healthz",
  "design-system",
];
const FILE_EXTENSION = /\.[a-z0-9]+$/i;

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

export type InternalPrefixMatch =
  | { kind: "none" }
  | { kind: "invalid" }
  | { kind: "redirect"; locale: Locale; pathname: string };

/**
 * Checks whether an external request names an internal route segment (`vi`,
 * `en-auth`, ...) as its first path segment. The segment is percent-decoded
 * and lowercased first: Next decodes dynamic params, so `/%76i-auth/a.pdf`
 * would otherwise reach the `vi-auth` segment without the site-auth cookie.
 *
 * @returns `redirect` with the unprefixed path, `invalid` for a first segment
 * that cannot be decoded or hides an internal segment behind an encoded `/`,
 * otherwise `none`.
 */
export function matchInternalPrefix(pathname: string): InternalPrefixMatch {
  const [, rawSegment = "", ...rest] = pathname.split("/");
  let segment: string;
  try {
    segment = decodeURIComponent(rawSegment).toLowerCase();
  } catch {
    return { kind: "invalid" };
  }

  const [head = "", ...encodedSlashParts] = segment.split("/");
  const parsed = parseRouteSegment(head);
  if (!parsed) return { kind: "none" };
  if (encodedSlashParts.length > 0) return { kind: "invalid" };
  return {
    kind: "redirect",
    locale: parsed.locale,
    pathname: `/${rest.join("/")}`,
  };
}

/** Whether the path is a public page that lives under `[locale]`. */
export function isLocalizedPath(pathname: string): boolean {
  const isUnlocalized = UNLOCALIZED_SEGMENTS.some(
    (segment) =>
      pathname === `/${segment}` || pathname.startsWith(`/${segment}/`),
  );
  return !isUnlocalized && !FILE_EXTENSION.test(pathname);
}

export function toRouteSegment({
  locale,
  isSiteAuthorized,
}: RouteSegment): string {
  return isSiteAuthorized ? `${locale}${SITE_AUTH_SEGMENT_SUFFIX}` : locale;
}

/** Parses the `[locale]` segment value; null when it is not one we produce. */
export function parseRouteSegment(segment: string): RouteSegment | null {
  if (isLocale(segment)) return { locale: segment, isSiteAuthorized: false };
  const locale = segment.endsWith(SITE_AUTH_SEGMENT_SUFFIX)
    ? segment.slice(0, -SITE_AUTH_SEGMENT_SUFFIX.length)
    : null;
  return isLocale(locale) ? { locale, isSiteAuthorized: true } : null;
}

/** Internal route path for a public path, e.g. `/posts/a` -> `/vi/posts/a`. */
export function localizePath(segment: RouteSegment, pathname: string): string {
  const prefix = `/${toRouteSegment(segment)}`;
  return pathname === "/" ? prefix : `${prefix}${pathname}`;
}

/** Internal route paths of every segment variant, used for revalidation. */
export function localizePathForAllLocales(pathname: string): string[] {
  return locales.flatMap((locale) =>
    [false, true].map((isSiteAuthorized) =>
      localizePath({ locale, isSiteAuthorized }, pathname),
    ),
  );
}

/**
 * Rewrites from public paths to the internal `[locale]` routes, keyed on the
 * locale and site-auth cookies.
 *
 * They live in `next.config` rather than the middleware because Next 15 only
 * re-applies config rewrites when deciding whether a request may use the ISR
 * cache; a middleware rewrite to `/[locale]/posts/[slug]` is never cached.
 */
export function buildLocaleRewrites(): Rewrite[] {
  const internalSegments = locales.flatMap((locale) => [
    locale,
    `${locale}${SITE_AUTH_SEGMENT_SUFFIX}`,
  ]);
  const excludedSegments = [...UNLOCALIZED_SEGMENTS, ...internalSegments];
  // Any non-root path whose first segment is not excluded and that does not
  // look like a file (`/og.png`).
  const pathSource = `/:path((?!(?:${excludedSegments.join("|")})(?:/|$))(?!.*\\.[a-zA-Z0-9]+$).+)`;

  const siteAuthHas = {
    type: "cookie",
    key: SITE_AUTH_COOKIE,
    value: "true",
  } as const;
  const localeHas = (locale: Locale) =>
    ({ type: "cookie", key: LOCALE_COOKIE, value: locale }) as const;

  // First match wins, so cookie-specific variants come before the default.
  const otherLocales = locales.filter((locale) => locale !== defaultLocale);
  const variants: { segment: RouteSegment; has: Rewrite["has"] }[] = [
    ...otherLocales.map((locale) => ({
      segment: { locale, isSiteAuthorized: true },
      has: [localeHas(locale), siteAuthHas],
    })),
    {
      segment: { locale: defaultLocale, isSiteAuthorized: true },
      has: [siteAuthHas],
    },
    ...otherLocales.map((locale) => ({
      segment: { locale, isSiteAuthorized: false },
      has: [localeHas(locale)],
    })),
    { segment: { locale: defaultLocale, isSiteAuthorized: false }, has: [] },
  ];

  return variants.flatMap(({ segment, has }) => {
    const prefix = `/${toRouteSegment(segment)}`;
    const conditions = has?.length ? { has } : {};
    return [
      { source: "/", destination: prefix, ...conditions },
      { source: pathSource, destination: `${prefix}/:path`, ...conditions },
    ];
  });
}
