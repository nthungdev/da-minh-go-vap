import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppPost } from "@/definitions";
import {
  buildPaginatedPostsInitialData,
  buildPostGroupInitialData,
  type PaginatedPostsData,
  shouldHidePagination,
} from "./post-pagination.ts";

function makeMockPost(slug: string): AppPost {
  return { slug } as AppPost;
}

describe("buildPostGroupInitialData", () => {
  it("preserves full SSR pagination metadata when initialData is provided", () => {
    const initialData: PaginatedPostsData = {
      posts: [makeMockPost("post-1"), makeMockPost("post-2")],
      hasMore: true,
      page: 1,
      totalPages: 4,
    };

    assert.deepEqual(buildPostGroupInitialData({ initialData }), initialData);
  });

  it("prefers initialData over legacy posts when both are provided", () => {
    const initialData: PaginatedPostsData = {
      posts: [makeMockPost("post-1")],
      hasMore: true,
      page: 1,
      totalPages: 2,
    };

    assert.deepEqual(
      buildPostGroupInitialData({
        initialData,
        posts: [makeMockPost("legacy")],
      }),
      initialData,
    );
  });

  it("falls back to single-page defaults when only legacy posts are provided", () => {
    const posts = [makeMockPost("post-1")];

    assert.deepEqual(buildPostGroupInitialData({ posts }), {
      posts,
      hasMore: false,
      page: 1,
      totalPages: 1,
    });
  });

  it("returns undefined when neither initialData nor posts is provided", () => {
    assert.equal(buildPostGroupInitialData({}), undefined);
  });
});

describe("buildPaginatedPostsInitialData", () => {
  const ssrPageOne: PaginatedPostsData = {
    posts: [makeMockPost("post-1"), makeMockPost("post-2")],
    hasMore: true,
    page: 1,
    totalPages: 3,
  };

  it("seeds React Query initialData with real SSR metadata on page 1", () => {
    assert.deepEqual(
      buildPaginatedPostsInitialData({ page: 1, initialData: ssrPageOne }),
      ssrPageOne,
    );
  });

  it("preserves empty SSR initialData on page 1 when explicitly provided", () => {
    const emptySsr: PaginatedPostsData = {
      posts: [],
      hasMore: false,
      page: 1,
      totalPages: 0,
    };

    assert.deepEqual(
      buildPaginatedPostsInitialData({ page: 1, initialData: emptySsr }),
      emptySsr,
    );
  });

  it("returns undefined when page > 1 so subsequent pages fetch fresh data", () => {
    assert.equal(
      buildPaginatedPostsInitialData({ page: 2, initialData: ssrPageOne }),
      undefined,
    );
  });

  it("returns undefined when initialData is for a non-1 page", () => {
    assert.equal(
      buildPaginatedPostsInitialData({
        page: 1,
        initialData: { ...ssrPageOne, page: 2 },
      }),
      undefined,
    );
  });

  it("falls back to hasMore: false and totalPages: 1 for legacy non-empty posts on page 1", () => {
    const posts = [makeMockPost("post-1")];

    assert.deepEqual(buildPaginatedPostsInitialData({ page: 1, posts }), {
      posts,
      hasMore: false,
      page: 1,
      totalPages: 1,
    });
  });

  it("returns undefined for legacy empty posts or when page > 1", () => {
    const posts = [makeMockPost("post-1")];
    assert.equal(
      buildPaginatedPostsInitialData({ page: 1, posts: [] }),
      undefined,
    );
    assert.equal(buildPaginatedPostsInitialData({ page: 2, posts }), undefined);
    assert.equal(buildPaginatedPostsInitialData({ page: 1 }), undefined);
  });
});

describe("shouldHidePagination", () => {
  it("hides pagination on page 1 when hasMore is false and totalPages <= 1", () => {
    assert.equal(
      shouldHidePagination({ hasMore: false, totalPages: 1, page: 1 }),
      true,
    );
    assert.equal(
      shouldHidePagination({ hasMore: false, totalPages: 0, page: 1 }),
      true,
    );
  });

  it("shows pagination on page 1 when hasMore is true", () => {
    assert.equal(
      shouldHidePagination({ hasMore: true, totalPages: 2, page: 1 }),
      false,
    );
    assert.equal(
      shouldHidePagination({ hasMore: true, totalPages: 1, page: 1 }),
      false,
    );
  });

  it("shows pagination on page 1 when totalPages > 1 even if hasMore is false", () => {
    assert.equal(
      shouldHidePagination({ hasMore: false, totalPages: 2, page: 1 }),
      false,
    );
  });

  it("shows pagination on page > 1 even when hasMore is false", () => {
    assert.equal(
      shouldHidePagination({ hasMore: false, totalPages: 2, page: 2 }),
      false,
    );
    assert.equal(
      shouldHidePagination({ hasMore: false, totalPages: 1, page: 2 }),
      false,
    );
  });
});
