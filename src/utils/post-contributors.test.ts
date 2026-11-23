import assert from "node:assert/strict";
import test from "node:test";
import {
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

test("groupPostContributors returns [] for missing rows", () => {
  assert.deepEqual(groupPostContributors(undefined), []);
  assert.deepEqual(groupPostContributors(null), []);
});

test("formatContributorNames uses the locale list format", () => {
  assert.equal(formatContributorNames(["A", "B"], "vi"), "A và B");
  assert.equal(formatContributorNames(["A", "B", "C"], "en"), "A, B, and C");
});
