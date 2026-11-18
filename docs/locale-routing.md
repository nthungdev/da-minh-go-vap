# Locale routing and page caching

Public URLs carry no locale (`/posts/abc`, never `/en/posts/abc`). The locale comes from the `locale` cookie, which the locale switcher sets. Each locale is rendered and cached as its own static (ISR) page.

## Request flow

1. `src/middleware.ts` runs first:
   - External requests to an internal prefix (`/vi/...`, `/en/...`, `/vi-auth/...`, `/en-auth/...`) get a `307` to the unprefixed URL. For a locale prefix it also sets the `locale` cookie, never the site-auth cookie. Every page therefore has exactly one public URL.
   - It sets `x-pathname`, `x-href` and `x-origin` and handles basic auth, as before.
   - It sets `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` on public pages.
2. Rewrites in `next.config.ts` (`buildLocaleRewrites()` in `src/i18n/routing.ts`) map `/foo` to the internal route `/{segment}/foo`:

   | Cookies                           | Segment   |
   | --------------------------------- | --------- |
   | `locale=en`, `x-site-auth=true`   | `en-auth` |
   | `x-site-auth=true`                | `vi-auth` |
   | `locale=en`                       | `en`      |
   | none, or any other `locale` value | `vi`      |

3. `src/app/(app)/[locale]/...` renders the page. `applyRouteLocale()` (`src/i18n/server.ts`) validates the segment and calls next-intl's `setRequestLocale`. `src/i18n/request.ts` then reads the locale from `requestLocale` rather than from cookies.

The rewrite lives in `next.config` rather than in the middleware for a specific reason. Next 15 decides whether a request may use the ISR cache by matching the URL against the route's pattern, and it re-applies only config rewrites before that match. After a middleware rewrite, `/posts/abc` does not match `/[locale]/posts/[slug]`, so the page is rendered on every request.

## Caching

- Every route under `[locale]` exports `revalidate = 60`. The homepage is prerendered at build time for `en` and `vi`. Other pages, posts and tag pages render on their first request and are then served from Next's ISR cache.
- A warm response carries `x-nextjs-cache: HIT` and does not query MongoDB. `MISS` means a first render. `STALE` means a cached page was served while it re-renders in the background.
- Responses stay `cache-control: private`. A CDN must not cache them, because one URL maps to two locales. Shared CDN caching would need the locale in the URL.
- Publishing calls `/api/revalidate`. That route revalidates the path under every segment (`/vi/...`, `/en/...`, `/vi-auth/...`, `/en-auth/...`) along with the cache tags. Tags also invalidate cached pages that used the tagged queries, such as the navbar menu.
- `/posts` (the filter page) reads `searchParams`, so it renders on every request.

## Pages that require basic auth

Pages and posts with `requireHttpBasicAuth` cannot read cookies during a static render. Instead, visitors who hold the `x-site-auth` cookie are rewritten to the `*-auth` segment, which has its own cached copy. In other segments the page redirects to `/auth/basic?nextUrl=<path>`. As before, the gate trusts the `x-site-auth` cookie.
