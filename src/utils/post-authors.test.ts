import assert from "node:assert/strict";
import test from "node:test";
import type { Author } from "@/payload-types";
import {
  formatPostAuthorNames,
  getPostAuthorNames,
  type PostAuthorsValue,
} from "./post-authors.ts";

function makeAuthor(name: string, honorific?: string | null): Author {
  return {
    id: `author-${name}`,
    name,
    honorific,
    updatedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

test("getPostAuthorNames returns [] for missing or empty authors", () => {
  assert.deepEqual(getPostAuthorNames(undefined), []);
  assert.deepEqual(getPostAuthorNames(null), []);
  assert.deepEqual(getPostAuthorNames([]), []);
});

test("getPostAuthorNames formats a single author", () => {
  assert.deepEqual(getPostAuthorNames([makeAuthor("Phêrô", "Lm.")]), [
    "Lm. Phêrô",
  ]);
});

test("getPostAuthorNames keeps the order of several authors", () => {
  const authors = [
    makeAuthor("Giuse", "Lm."),
    makeAuthor("Anna"),
    makeAuthor("Phaolô", "Tu sĩ"),
  ];
  assert.deepEqual(getPostAuthorNames(authors), [
    "Lm. Giuse",
    "Anna",
    "Tu sĩ Phaolô",
  ]);
});

test("getPostAuthorNames trims names and honorifics", () => {
  const authors = [
    makeAuthor("  Giuse  ", "  Lm.  "),
    makeAuthor(" Anna ", "   "),
    makeAuthor("Maria", null),
  ];
  assert.deepEqual(getPostAuthorNames(authors), ["Lm. Giuse", "Anna", "Maria"]);
});

test("getPostAuthorNames skips authors with an empty or blank name", () => {
  const authors = [
    makeAuthor("", "Lm."),
    makeAuthor("   ", "Tu sĩ"),
    makeAuthor("Anna"),
  ];
  assert.deepEqual(getPostAuthorNames(authors), ["Anna"]);
});

test("getPostAuthorNames skips unpopulated ids and null references", () => {
  const authors: PostAuthorsValue = [
    "author-id-1",
    null,
    makeAuthor("Giuse", "Lm."),
    "author-id-2",
  ];
  assert.deepEqual(getPostAuthorNames(authors), ["Lm. Giuse"]);
});

test("formatPostAuthorNames joins names in Vietnamese", () => {
  assert.equal(formatPostAuthorNames([], "vi"), "");
  assert.equal(formatPostAuthorNames(["A"], "vi"), "A");
  assert.equal(formatPostAuthorNames(["A", "B"], "vi"), "A và B");
  assert.equal(formatPostAuthorNames(["A", "B", "C"], "vi"), "A, B và C");
});

test("formatPostAuthorNames joins names in English", () => {
  assert.equal(formatPostAuthorNames([], "en"), "");
  assert.equal(formatPostAuthorNames(["A"], "en"), "A");
  assert.equal(formatPostAuthorNames(["A", "B"], "en"), "A and B");
  assert.equal(formatPostAuthorNames(["A", "B", "C"], "en"), "A, B, and C");
});
