import assert from "node:assert/strict";
import test from "node:test";
import {
  contributorRoles,
  formatContributorNames,
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
    { role: "translator", names: ["C", "B"] },
    { role: "author", names: ["Lm. A"] },
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
      { role: "author", names: ["Lm. Nguyễn Văn A"] },
      { role: "narrator", names: ["Lm. Nguyễn Văn A"] },
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
  assert.deepEqual(groups, [{ role: "author", names: ["Lm. A", "B", "C"] }]);
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
  assert.deepEqual(groups, [{ role: "photographer", names: ["Kept"] }]);
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
