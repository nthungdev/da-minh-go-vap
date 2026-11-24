import assert from "node:assert/strict";
import test from "node:test";
import {
  contributorRoles,
  formatContributorListParts,
  formatContributorNames,
  getContributorCredits,
  getContributorDisplayName,
  getContributorNames,
  groupPostContributors,
} from "./post-contributors.ts";

test("groupPostContributors groups by role in first-appearance order", () => {
  const groups = groupPostContributors([
    { person: { name: "C" }, role: "translator" },
    { person: { name: "A", honorific: "Lm." }, role: "author" },
    { person: "unpopulated-id", role: "author" },
    { person: null, role: "author" },
    { person: { name: "B" }, role: "translator" },
  ]);
  assert.deepEqual(groups, [
    { role: "translator", people: [{ name: "C" }, { name: "B" }] },
    { role: "author", people: [{ name: "Lm. A" }] },
  ]);
  assert.deepEqual(getContributorNames(groups, "author"), ["Lm. A"]);
  assert.deepEqual(getContributorNames(groups, "editor"), []);
});

test("groupPostContributors returns [] for missing or empty rows", () => {
  assert.deepEqual(groupPostContributors(undefined), []);
  assert.deepEqual(groupPostContributors(null), []);
  assert.deepEqual(groupPostContributors([]), []);
});

test("groupPostContributors lists one person under each of their roles", () => {
  const person = { name: "Nguyễn Văn A", honorific: "Lm." };
  assert.deepEqual(
    groupPostContributors([
      { person, role: "author" },
      { person, role: "narrator" },
    ]),
    [
      { role: "author", people: [{ name: "Lm. Nguyễn Văn A" }] },
      { role: "narrator", people: [{ name: "Lm. Nguyễn Văn A" }] },
    ],
  );
});

test("groupPostContributors keeps row order within a role", () => {
  const groups = groupPostContributors([
    { person: { name: "Z" }, role: "author" },
    { person: { name: "M" }, role: "editor" },
    { person: { name: "A" }, role: "author" },
    { person: { name: "K" }, role: "author" },
  ]);
  assert.deepEqual(getContributorNames(groups, "author"), ["Z", "A", "K"]);
  assert.deepEqual(
    groups.map((group) => group.role),
    ["author", "editor"],
  );
});

test("groupPostContributors trims names and honorifics", () => {
  const groups = groupPostContributors([
    { person: { name: "  A  ", honorific: "  Lm.  " }, role: "author" },
    { person: { name: "B", honorific: "   " }, role: "author" },
    { person: { name: "C", honorific: null }, role: "author" },
  ]);
  assert.deepEqual(groups, [
    {
      role: "author",
      people: [{ name: "Lm. A" }, { name: "B" }, { name: "C" }],
    },
  ]);
});

test("groupPostContributors skips rows without a displayable person or role", () => {
  const groups = groupPostContributors([
    { person: "unpopulated-id", role: "author" },
    { person: null, role: "author" },
    { person: undefined, role: "author" },
    { person: { name: "" }, role: "author" },
    { person: { name: "   ", honorific: "Lm." }, role: "author" },
    { person: { name: "No role" }, role: null },
    { person: { name: "Missing role" } },
    { person: { name: "Kept" }, role: "photographer" },
  ]);
  assert.deepEqual(groups, [
    { role: "photographer", people: [{ name: "Kept" }] },
  ]);
});

test("contributorRoles lists the supported roles in display order", () => {
  assert.deepEqual(contributorRoles, [
    "author",
    "translator",
    "narrator",
    "editor",
    "presenter",
    "producer",
    "photographer",
  ]);
});

test("formatContributorNames formats 0-3 names in vi", () => {
  assert.equal(formatContributorNames([], "vi"), "");
  assert.equal(formatContributorNames(["A"], "vi"), "A");
  assert.equal(formatContributorNames(["A", "B"], "vi"), "A và B");
  assert.equal(formatContributorNames(["A", "B", "C"], "vi"), "A, B và C");
});

test("formatContributorNames formats 0-3 names in en", () => {
  assert.equal(formatContributorNames([], "en"), "");
  assert.equal(formatContributorNames(["A"], "en"), "A");
  assert.equal(formatContributorNames(["A", "B"], "en"), "A and B");
  assert.equal(formatContributorNames(["A", "B", "C"], "en"), "A, B, and C");
});

test("groupPostContributors keeps contributor ids for byline links", () => {
  const groups = groupPostContributors([
    { person: { id: "c1", name: "A", honorific: "Lm." }, role: "author" },
    { person: { id: "c2", name: "B" }, role: "translator" },
    { person: { name: "No id" }, role: "author" },
  ]);
  assert.deepEqual(getContributorCredits(groups, "author"), [
    { id: "c1", name: "Lm. A" },
    { name: "No id" },
  ]);
  assert.deepEqual(getContributorCredits(groups, "translator"), [
    { id: "c2", name: "B" },
  ]);
  assert.deepEqual(getContributorCredits(groups, "editor"), []);
});

test("getContributorNames returns only the requested role for SEO authors", () => {
  const groups = groupPostContributors([
    { person: { id: "c1", name: "A" }, role: "author" },
    { person: { id: "c2", name: "T" }, role: "translator" },
    { person: { id: "c3", name: "N" }, role: "narrator" },
  ]);
  assert.deepEqual(getContributorNames(groups, "author"), ["A"]);
});

test("getContributorDisplayName prefixes a trimmed honorific", () => {
  assert.equal(
    getContributorDisplayName({ name: " A ", honorific: " Lm. " }),
    "Lm. A",
  );
  assert.equal(getContributorDisplayName({ name: "A", honorific: null }), "A");
  assert.equal(getContributorDisplayName({ name: "  ", honorific: "Lm." }), "");
});

test("formatContributorListParts keeps each person with locale separators", () => {
  const a = { id: "c1", name: "A" };
  const b = { id: "c2", name: "B" };
  const c = { name: "C" };
  assert.deepEqual(formatContributorListParts([a], "vi"), [
    { type: "person", person: a },
  ]);
  assert.deepEqual(formatContributorListParts([a, b, c], "vi"), [
    { type: "person", person: a },
    { type: "literal", value: ", " },
    { type: "person", person: b },
    { type: "literal", value: " và " },
    { type: "person", person: c },
  ]);
  assert.deepEqual(formatContributorListParts([a, b], "en"), [
    { type: "person", person: a },
    { type: "literal", value: " and " },
    { type: "person", person: b },
  ]);
  assert.deepEqual(formatContributorListParts([], "en"), []);
});
