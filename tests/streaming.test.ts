import assert from "node:assert/strict";
import test from "node:test";
import {
  EAGER_BLOCK_COUNT,
  getCategoryPostsKey,
  shouldStreamBlock,
} from "../src/utils/streaming.ts";

test("the first block of a section always renders eagerly", () => {
  assert.equal(EAGER_BLOCK_COUNT, 1);
  assert.equal(shouldStreamBlock("postGroupBlock", 0), false);
});

test("later postGroupBlocks stream behind Suspense", () => {
  assert.equal(shouldStreamBlock("postGroupBlock", 1), true);
  assert.equal(shouldStreamBlock("postGroupBlock", 5), true);
});

test("other block types are never deferred", () => {
  for (const type of ["imageSlideshowBlock", "textBlock", "linksBlock"]) {
    assert.equal(shouldStreamBlock(type, 3), false);
  }
});

test("eager count is configurable", () => {
  assert.equal(shouldStreamBlock("postGroupBlock", 1, 2), false);
  assert.equal(shouldStreamBlock("postGroupBlock", 2, 2), true);
});

test("category key ignores tag order and duplicates", () => {
  assert.equal(getCategoryPostsKey(["b", "a", "b"]), "a,b");
  assert.equal(
    getCategoryPostsKey(["a", "b"]),
    getCategoryPostsKey(["b", "a"]),
  );
  assert.equal(getCategoryPostsKey([]), "");
});
