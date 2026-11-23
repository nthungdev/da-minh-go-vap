import assert from "node:assert/strict";
import test from "node:test";
import {
  parsePostsPageParams,
  resolvePostsPageTitle,
} from "./posts-page-params.ts";

const id = "64b7f0c2a1b2c3d4e5f60718";

test("parsePostsPageParams keeps a valid contributor id", () => {
  assert.deepEqual(parsePostsPageParams({ c: id }), {
    hiddenTags: [],
    title: undefined,
    contributorId: id,
    invalid: false,
  });
  assert.equal(parsePostsPageParams({ c: ` ${id} ` }).contributorId, id);
  assert.equal(
    parsePostsPageParams({ c: id.toUpperCase() }).contributorId,
    id.toUpperCase(),
  );
});

test("parsePostsPageParams flags a malformed contributor id as invalid", () => {
  for (const c of [
    "",
    "abc",
    `${id}0`,
    "zzzzzzzzzzzzzzzzzzzzzzzz",
    '{"$ne":1}',
  ]) {
    const params = parsePostsPageParams({ c });
    assert.equal(params.invalid, true, c);
    assert.equal(params.contributorId, undefined, c);
  }
});

test("parsePostsPageParams without c is valid and has no contributor", () => {
  const params = parsePostsPageParams({});
  assert.equal(params.invalid, false);
  assert.equal(params.contributorId, undefined);
  assert.deepEqual(params.hiddenTags, []);
});

test("parsePostsPageParams splits and decodes ht and decodes ti", () => {
  const params = parsePostsPageParams({
    ht: encodeURIComponent("tin-tuc,suy-niem"),
    ti: encodeURIComponent("Tin tức & Suy niệm"),
    c: id,
  });
  assert.deepEqual(params.hiddenTags, ["tin-tuc", "suy-niem"]);
  assert.equal(params.title, "Tin tức & Suy niệm");
  assert.equal(params.contributorId, id);
});

test("resolvePostsPageTitle prefers ti, then the contributor name, then the default", () => {
  assert.equal(
    resolvePostsPageTitle({ title: "Ti" }, "Lm. A", "Bài viết"),
    "Ti",
  );
  assert.equal(resolvePostsPageTitle({}, "Lm. A", "Bài viết"), "Lm. A");
  assert.equal(resolvePostsPageTitle({}, undefined, "Bài viết"), "Bài viết");
});
