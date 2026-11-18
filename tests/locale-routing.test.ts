import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getRouteSegmentPrefix,
  isLocalizedPath,
  localizePath,
  localizePathForAllLocales,
  buildLocaleRewrites,
  parseRouteSegment,
  stripLocalePrefix,
} from "../src/i18n/routing.ts";

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

test("locale prefixes are detected by whole segment", () => {
  assert.equal(getRouteSegmentPrefix("/en")?.locale, "en");
  assert.equal(getRouteSegmentPrefix("/vi/posts/x")?.locale, "vi");
  assert.deepEqual(getRouteSegmentPrefix("/vi-auth/bantin"), {
    locale: "vi",
    isSiteAuthorized: true,
  });
  assert.equal(getRouteSegmentPrefix("/video"), null);
  assert.equal(getRouteSegmentPrefix("/english/x"), null);
  assert.equal(stripLocalePrefix("/en"), "/");
  assert.equal(stripLocalePrefix("/en-auth/bantin/x"), "/bantin/x");
  assert.equal(stripLocalePrefix("/vi/posts/x"), "/posts/x");
  assert.equal(stripLocalePrefix("/posts/x"), "/posts/x");
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
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /export const revalidate = 60;/);
    assert.match(source, /applyRouteLocale\(/);
    // getLocale() without setRequestLocale, and the auth guard's old
    // cookies()/headers() reads, opt the route out of static rendering.
    assert.doesNotMatch(source, /getLocale\(|basicAuthGuard|next\/headers/);
  });
}

test("next-intl request config does not read cookies", () => {
  const source = readFileSync(
    new URL("../src/i18n/request.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /next\/headers/);
  assert.match(source, /requestLocale/);
});
