import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PUBLISHED_CONTENT_REVALIDATE_SECONDS } from "./published-content-cache.ts";

// Mega-menu posts (and their publishedAt filter) live in menu-category-posts.ts.
const CACHED_SOURCES = [
  "src/utils/post-server.ts",
  "src/utils/menu-category-posts.ts",
];

// Arguments of an `unstable_cache` call become part of its cache key, so a
// time value there splits the cache once per bucket.
const TIME_KEY_PATTERNS = [
  /TimeBucket/,
  /nowIso:\s*string/,
  /Math\.floor\(Date\.now\(\)/,
];

test("published-content queries refresh within 60 seconds", () => {
  assert.equal(PUBLISHED_CONTENT_REVALIDATE_SECONDS, 60);
});

for (const file of CACHED_SOURCES) {
  test(`${file} keeps the current time out of cache keys`, () => {
    const source = readFileSync(
      new URL(`../../${file}`, import.meta.url),
      "utf8",
    );
    for (const pattern of TIME_KEY_PATTERNS) {
      assert.doesNotMatch(source, pattern);
    }
    assert.match(source, /revalidate: PUBLISHED_CONTENT_REVALIDATE_SECONDS/);
  });
}
