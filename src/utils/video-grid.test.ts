import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_VIDEO_PAGE_SIZE,
  extractYoutubeId,
  isYoutubeShort,
  normalizeVideoPageSize,
  paginateVideos,
  resolveVideoPage,
  type VideoItem,
} from "./video-grid.ts";

function makeVideos(count: number): VideoItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `video-${index + 1}`,
    title: `Video ${index + 1}`,
    type: "youtube",
    url: `https://www.youtube.com/watch?v=dQw4w9WgXc${index % 10}`,
  }));
}

describe("normalizeVideoPageSize", () => {
  it("defaults to 8 when undefined, null, zero, negative, or non-finite", () => {
    assert.equal(normalizeVideoPageSize(), DEFAULT_VIDEO_PAGE_SIZE);
    assert.equal(normalizeVideoPageSize(undefined), 8);
    assert.equal(normalizeVideoPageSize(null), 8);
    assert.equal(normalizeVideoPageSize(0), 8);
    assert.equal(normalizeVideoPageSize(-3), 8);
    assert.equal(normalizeVideoPageSize(Number.NaN), 8);
    assert.equal(normalizeVideoPageSize(Number.POSITIVE_INFINITY), 8);
  });

  it("floors positive floats and preserves positive integers", () => {
    assert.equal(normalizeVideoPageSize(4), 4);
    assert.equal(normalizeVideoPageSize(5.9), 5);
    assert.equal(normalizeVideoPageSize(0.5), 8);
  });
});

describe("resolveVideoPage", () => {
  it("falls back to page 1 for null, empty, zero, negative, or non-numeric values", () => {
    assert.equal(resolveVideoPage(null, 3), 1);
    assert.equal(resolveVideoPage(undefined, 3), 1);
    assert.equal(resolveVideoPage("", 3), 1);
    assert.equal(resolveVideoPage("   ", 3), 1);
    assert.equal(resolveVideoPage("0", 3), 1);
    assert.equal(resolveVideoPage("-1", 3), 1);
    assert.equal(resolveVideoPage("abc", 3), 1);
    assert.equal(resolveVideoPage("2abc", 3), 1);
  });

  it("clamps out-of-range page numbers to totalPages", () => {
    assert.equal(resolveVideoPage("2", 3), 2);
    assert.equal(resolveVideoPage("3", 3), 3);
    assert.equal(resolveVideoPage("99", 3), 3);
    assert.equal(resolveVideoPage("99", 0), 1);
  });
});

describe("paginateVideos", () => {
  it("slices videos using the default pageSize of 8", () => {
    const videos = makeVideos(18);

    const page1 = paginateVideos(videos, 1);
    assert.equal(page1.pageSize, 8);
    assert.equal(page1.totalPages, 3);
    assert.equal(page1.activePage, 1);
    assert.deepEqual(
      page1.items.map((v) => v.id),
      [
        "video-1",
        "video-2",
        "video-3",
        "video-4",
        "video-5",
        "video-6",
        "video-7",
        "video-8",
      ],
    );

    const page2 = paginateVideos(videos, 2);
    assert.equal(page2.activePage, 2);
    assert.equal(page2.items.length, 8);
    assert.equal(page2.items[0]?.id, "video-9");
    assert.equal(page2.items[7]?.id, "video-16");

    const page3 = paginateVideos(videos, 3);
    assert.equal(page3.activePage, 3);
    assert.deepEqual(
      page3.items.map((v) => v.id),
      ["video-17", "video-18"],
    );
  });

  it("supports custom pageSize and clamps invalid page numbers", () => {
    const videos = makeVideos(7);

    const page2 = paginateVideos(videos, 2, 3);
    assert.equal(page2.pageSize, 3);
    assert.equal(page2.totalPages, 3);
    assert.equal(page2.activePage, 2);
    assert.deepEqual(
      page2.items.map((v) => v.id),
      ["video-4", "video-5", "video-6"],
    );

    const clampedHigh = paginateVideos(videos, 99, 3);
    assert.equal(clampedHigh.activePage, 3);
    assert.deepEqual(
      clampedHigh.items.map((v) => v.id),
      ["video-7"],
    );

    const clampedLow = paginateVideos(videos, -2, 3);
    assert.equal(clampedLow.activePage, 1);
    assert.equal(clampedLow.items.length, 3);
  });

  it("reports totalPages <= 1 when videos fit on one page and > 1 otherwise", () => {
    assert.equal(paginateVideos(makeVideos(0), 1, 8).totalPages, 0);
    assert.equal(paginateVideos(makeVideos(8), 1, 8).totalPages, 1);
    assert.equal(paginateVideos(makeVideos(9), 1, 8).totalPages, 2);
  });
});

describe("extractYoutubeId", () => {
  it("extracts IDs from watch, short, embed, youtu.be, and bare ID inputs", () => {
    assert.equal(extractYoutubeId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(
      extractYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
    assert.equal(
      extractYoutubeId("https://youtu.be/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
    assert.equal(
      extractYoutubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
    assert.equal(
      extractYoutubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
    assert.equal(extractYoutubeId("not-a-valid-youtube-url"), "");
    assert.equal(
      extractYoutubeId("https://example.com/watch?v=dQw4w9WgXcQ"),
      "",
    );
    assert.equal(extractYoutubeId(""), "");
  });
});

describe("isYoutubeShort", () => {
  it("detects shorts from URL path or explicit flag", () => {
    assert.equal(
      isYoutubeShort("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
      true,
    );
    assert.equal(
      isYoutubeShort("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      false,
    );
    assert.equal(isYoutubeShort("dQw4w9WgXcQ", true), true);
    assert.equal(isYoutubeShort("dQw4w9WgXcQ", false), false);
  });
});
