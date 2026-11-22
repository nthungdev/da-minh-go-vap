import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildLocaleRewrites,
  isLocalizedPath,
  localizePath,
  localizePathForAllLocales,
  matchInternalPrefix,
  parseRouteSegment,
} from "./routing.ts";

/** Simulates Next's first-match rewrite resolution for one request. */
function rewrite(pathname: string, cookies: Record<string, string> = {}) {
  for (const rule of buildLocaleRewrites()) {
    const sourcePattern =
      rule.source === "/"
        ? /^\/$/
        : new RegExp(`^/(${rule.source.slice("/:path(".length, -1)})$`);
    const match = sourcePattern.exec(pathname);
    if (!match) continue;
    const cookieMatches = (rule.has ?? []).every(
      (condition) =>
        condition.type === "cookie" &&
        cookies[condition.key] === condition.value,
    );
    if (!cookieMatches) continue;
    return rule.destination.replace(":path", match[1] ?? "");
  }
  return null;
}

test("config rewrites pick the locale from the cookie, default Vietnamese", () => {
  assert.equal(rewrite("/"), "/vi");
  assert.equal(rewrite("/posts/a-b"), "/vi/posts/a-b");
  assert.equal(rewrite("/posts/a-b", { locale: "en" }), "/en/posts/a-b");
  assert.equal(rewrite("/", { locale: "en" }), "/en");
  assert.equal(rewrite("/lienhe", { locale: "fr" }), "/vi/lienhe");
  assert.equal(
    rewrite("/bantin", { "x-site-auth": "true" }),
    "/vi-auth/bantin",
  );
  assert.equal(
    rewrite("/bantin", { "x-site-auth": "true", locale: "en" }),
    "/en-auth/bantin",
  );
});

test("config rewrites skip internal, API and file paths", () => {
  for (const path of [
    "/api/revalidate",
    "/admin",
    "/_next/image",
    "/healthz",
    "/og.png",
    "/vi/posts/a",
    "/en",
    "/vi-auth/bantin",
  ]) {
    assert.equal(rewrite(path), null, path);
  }
  assert.equal(rewrite("/video"), "/vi/video");
  assert.equal(rewrite("/apis"), "/vi/apis");
});

test("public paths map to internal locale routes", () => {
  const en = { locale: "en", isSiteAuthorized: false } as const;
  const viAuth = { locale: "vi", isSiteAuthorized: true } as const;
  assert.equal(localizePath(en, "/"), "/en");
  assert.equal(localizePath(en, "/posts/a-b"), "/en/posts/a-b");
  assert.equal(localizePath(viAuth, "/bantin"), "/vi-auth/bantin");
  assert.deepEqual(localizePathForAllLocales("/gioi-thieu"), [
    "/en/gioi-thieu",
    "/en-auth/gioi-thieu",
    "/vi/gioi-thieu",
    "/vi-auth/gioi-thieu",
  ]);
});

test("route segments round-trip and reject unknown values", () => {
  assert.deepEqual(parseRouteSegment("vi"), {
    locale: "vi",
    isSiteAuthorized: false,
  });
  assert.deepEqual(parseRouteSegment("en-auth"), {
    locale: "en",
    isSiteAuthorized: true,
  });
  assert.equal(parseRouteSegment("fr"), null);
  assert.equal(parseRouteSegment("fr-auth"), null);
  assert.equal(parseRouteSegment("-auth"), null);
});

test("internal prefixes redirect to the unprefixed path", () => {
  assert.deepEqual(matchInternalPrefix("/en"), {
    kind: "redirect",
    locale: "en",
    pathname: "/",
  });
  assert.deepEqual(matchInternalPrefix("/vi/posts/x"), {
    kind: "redirect",
    locale: "vi",
    pathname: "/posts/x",
  });
  assert.deepEqual(matchInternalPrefix("/en-auth/bantin/x"), {
    kind: "redirect",
    locale: "en",
    pathname: "/bantin/x",
  });
  for (const path of ["/", "/video", "/english/x", "/posts/x"]) {
    assert.deepEqual(matchInternalPrefix(path), { kind: "none" }, path);
  }
});

// M1: Next decodes dynamic params, so encoded or upper-case spellings of an
// internal segment must be caught before they reach `[locale]`.
test("encoded and upper-case internal prefixes are redirected", () => {
  for (const [path, pathname] of [
    ["/%76i-auth/a.pdf", "/a.pdf"],
    ["/vi%2Dauth/a.b", "/a.b"],
    ["/VI-AUTH/x", "/x"],
    ["/%65%6E/x", "/x"],
  ] as const) {
    const match = matchInternalPrefix(path);
    assert.equal(match.kind, "redirect", path);
    assert.equal(match.kind === "redirect" && match.pathname, pathname, path);
  }
});

test("undecodable or slash-smuggled prefixes are rejected", () => {
  for (const path of [
    "/%E0%A4%A/x",
    "/%/x",
    "/vi-auth%2Fbantin%2Ftinnoibo.x",
    "/vi%2Fx",
  ]) {
    assert.deepEqual(matchInternalPrefix(path), { kind: "invalid" }, path);
  }
});

test("only page paths are rewritten", () => {
  for (const path of [
    "/",
    "/posts/a",
    "/posts/tags/x",
    "/auth/basic",
    "/apis",
  ]) {
    assert.ok(isLocalizedPath(path), path);
  }
  for (const path of [
    "/api/revalidate",
    "/admin",
    "/admin/collections/posts",
    "/_next/image",
    "/healthz",
    "/og.png",
    "/icon0.svg",
    "/manifest.webmanifest",
  ]) {
    assert.ok(!isLocalizedPath(path), path);
  }
});

const PUBLIC_ROUTE_FILES = [
  "src/app/(app)/[locale]/layout.tsx",
  "src/app/(app)/[locale]/[[...path]]/page.tsx",
  "src/app/(app)/[locale]/posts/[slug]/page.tsx",
  "src/app/(app)/[locale]/posts/tags/[tag]/page.tsx",
];

for (const file of PUBLIC_ROUTE_FILES) {
  test(`${file} renders statically per locale`, () => {
    const source = readFileSync(
      new URL(`../../${file}`, import.meta.url),
      "utf8",
    );
    assert.match(source, /export const revalidate = 60;/);
    assert.match(source, /applyRouteLocale\(/);
    // getLocale() without setRequestLocale, and the auth guard's old
    // cookies()/headers() reads, opt the route out of static rendering.
    assert.doesNotMatch(source, /getLocale\(|basicAuthGuard|next\/headers/);
  });
}

test("next-intl request config does not read cookies", () => {
  const source = readFileSync(new URL("./request.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /next\/headers/);
  assert.match(source, /requestLocale/);
});

/**
 * The middleware matcher as Next compiles it: an anchored regex over the
 * pathname (read from source because `config` must stay a static literal).
 */
function middlewareMatcher(): RegExp {
  const source = readFileSync(
    new URL("../middleware.ts", import.meta.url),
    "utf8",
  );
  const literal = /source:\s*("(?:[^"\\]|\\.)*")/.exec(source)?.[1];
  assert.ok(literal, "middleware matcher source not found");
  return new RegExp(`^${JSON.parse(literal) as string}$`);
}

// M2: a path rewritten without passing the middleware would miss the
// `private` cache-control and could be shared by a CDN across locales.
test("middleware runs on every path the locale rewrite localizes", () => {
  const matcher = middlewareMatcher();
  for (const path of [
    "/",
    "/administration",
    "/apix",
    "/manifesto",
    "/healthzz",
    "/robots",
    "/favicon",
    "/_nextx",
    "/posts/a",
  ]) {
    assert.ok(rewrite(path), `${path} should be localized`);
    assert.ok(isLocalizedPath(path), `${path} should be localized`);
    assert.match(path, matcher, `${path} must pass through the middleware`);
  }
});

test("middleware skips API, admin and static files", () => {
  const matcher = middlewareMatcher();
  for (const path of [
    "/api/revalidate",
    "/admin",
    "/admin/collections/posts",
    "/_next/static/chunks/a.js",
    "/_next/image",
    "/favicon.ico",
    "/robots.txt",
    "/manifest.webmanifest",
  ]) {
    assert.doesNotMatch(path, matcher, path);
  }
  // Internal-prefix redirects must run for encoded spellings too.
  for (const path of ["/%76i-auth/a.pdf", "/vi%2Dauth/a.b", "/VI-AUTH/x"]) {
    assert.match(path, matcher, path);
  }
});

// M5: the prefix redirect must not take its host from forwarded headers.
test("prefix redirect is built from nextUrl", () => {
  const source = readFileSync(
    new URL("../middleware.ts", import.meta.url),
    "utf8",
  );
  const redirectBlock = source.slice(
    source.indexOf('internalPrefix.kind === "redirect"'),
    source.indexOf("const authResult"),
  );
  assert.match(redirectBlock, /request\.nextUrl\.clone\(\)/);
  assert.doesNotMatch(redirectBlock, /origin|x-forwarded/i);
});
