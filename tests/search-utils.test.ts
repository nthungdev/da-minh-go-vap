import assert from "node:assert/strict";
import test from "node:test";
import {
  addRecentSearch,
  formatSearchPostDate,
  getPostPrimaryCategoryLabel,
  normalizeVietnamese,
  parseRecentSearches,
  resolveSearchTagOptions,
  splitHighlightSegments,
} from "../src/utils/search.ts";

test("normalizeVietnamese strips diacritics and maps đ/Đ", () => {
  assert.equal(normalizeVietnamese("Đa Minh Gò Vấp"), "da minh go vap");
  assert.equal(normalizeVietnamese("Suy niệm Tin Mừng"), "suy niem tin mung");
});

test("splitHighlightSegments highlights diacritic-insensitive matches accurately", () => {
  const segments = splitHighlightSegments(
    "Hội Dòng Đa Minh Gò Vấp: Suy niệm Lời Chúa",
    "da minh",
  );
  assert.deepEqual(segments, [
    { text: "Hội Dòng ", highlighted: false },
    { text: "Đa Minh", highlighted: true },
    { text: " Gò Vấp: Suy niệm Lời Chúa", highlighted: false },
  ]);
});

test("splitHighlightSegments handles precomposed characters before match without index drift", () => {
  const segments = splitHighlightSegments(
    "Lễ Thánh Đa Minh năm 2026",
    "da minh",
  );
  assert.deepEqual(segments, [
    { text: "Lễ Thánh ", highlighted: false },
    { text: "Đa Minh", highlighted: true },
    { text: " năm 2026", highlighted: false },
  ]);
});

test("splitHighlightSegments merges overlapping token matches", () => {
  const segments = splitHighlightSegments("Suy niệm Tin Mừng", "suy suy niem");
  assert.deepEqual(segments, [
    { text: "Suy", highlighted: true },
    { text: " ", highlighted: false },
    { text: "niệm", highlighted: true },
    { text: " Tin Mừng", highlighted: false },
  ]);

  const overlapping = splitHighlightSegments(
    "Suy niệm Tin Mừng",
    "suy niem tin",
  );
  assert.deepEqual(overlapping, [
    { text: "Suy niệm Tin", highlighted: true },
    { text: " Mừng", highlighted: false },
  ]);
});

test("splitHighlightSegments returns single unhighlighted segment for empty query", () => {
  assert.deepEqual(splitHighlightSegments("Bài viết mới", "   "), [
    { text: "Bài viết mới", highlighted: false },
  ]);
});

test("formatSearchPostDate formats valid dates per locale and handles invalid input", () => {
  const sample = new Date("2026-08-08T00:00:00.000Z");
  const viFormatted = formatSearchPostDate(sample, "vi");
  const enFormatted = formatSearchPostDate(sample, "en");

  assert.ok(viFormatted.includes("2026"));
  assert.ok(enFormatted.includes("2026"));
  assert.equal(formatSearchPostDate("not-a-date", "vi"), "");
  assert.equal(formatSearchPostDate(null, "en"), "");
});

test("getPostPrimaryCategoryLabel prefers public populated tags", () => {
  const label = getPostPrimaryCategoryLabel([
    "id-only-string",
    { label: "Nội bộ", isPublic: false },
    { label: "Suy niệm", isPublic: true },
  ]);
  assert.equal(label, "Suy niệm");

  assert.equal(
    getPostPrimaryCategoryLabel([{ label: "Tin hội dòng", isPublic: false }]),
    "Tin hội dòng",
  );
  assert.equal(getPostPrimaryCategoryLabel(["raw-id"]), null);
  assert.equal(getPostPrimaryCategoryLabel([]), null);
});

test("parseRecentSearches and addRecentSearch sanitize, deduplicate, and cap", () => {
  assert.deepEqual(parseRecentSearches(null), []);
  assert.deepEqual(parseRecentSearches("{bad json"), []);
  assert.deepEqual(
    parseRecentSearches(
      JSON.stringify(["Đa Minh", "đa minh", "", 42, "Tin Mừng"]),
    ),
    ["Đa Minh", "Tin Mừng"],
  );

  const updated = addRecentSearch(["Tin Mừng", "Đa Minh"], "đa minh", 5);
  assert.deepEqual(updated, ["đa minh", "Tin Mừng"]);

  const capped = addRecentSearch(["a", "b", "c", "d", "e"], "f", 5);
  assert.deepEqual(capped, ["f", "a", "b", "c", "d"]);
});

test("resolveSearchTagOptions normalizes populated tags and skips invalid refs", () => {
  const result = resolveSearchTagOptions([
    {
      id: "st-1",
      label: "  Suy niệm  ",
      tag: { id: "ht-1", label: "Suy niệm Lời Chúa" },
    },
    {
      id: "st-2",
      label: "",
      tag: { id: "ht-2", label: "Tin hội dòng" },
    },
    {
      id: "st-3",
      label: "Unpopulated",
      tag: "ht-3",
    },
    {
      id: "st-4",
      label: null,
      tag: null,
    },
    {
      id: "st-5",
      label: "   ",
      tag: { id: "ht-5", label: "   " },
    },
  ]);

  assert.deepEqual(result, [
    { id: "st-1", tagId: "ht-1", label: "Suy niệm" },
    { id: "st-2", tagId: "ht-2", label: "Tin hội dòng" },
  ]);
});
