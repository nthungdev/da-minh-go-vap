import assert from "node:assert/strict";
import test from "node:test";
import { makeContributorPostsPath } from "./post.ts";

test("makeContributorPostsPath builds an encoded /posts?c= path", () => {
  assert.equal(
    makeContributorPostsPath("64b7f0c2a1b2c3d4e5f60718"),
    "/posts?c=64b7f0c2a1b2c3d4e5f60718",
  );
  assert.equal(makeContributorPostsPath("a b&c"), "/posts?c=a%20b%26c");
});
