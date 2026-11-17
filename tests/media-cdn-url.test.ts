import assert from "node:assert/strict";
import test from "node:test";

process.env.NEXT_PUBLIC_MEDIA_CDN_URL = "https://cdn.example.test";
const { rewriteMediaUrls, toCdnMediaUrl, transformUrl } = await import(
  "../src/utils/cloudflare.ts"
);

const PROXY_PATH = "/api/media/file/";

test("toCdnMediaUrl rewrites Payload file URLs to the CDN origin", () => {
  assert.equal(
    toCdnMediaUrl("/api/media/file/gioi-thieu-muc-vu-giao-xu%20(2).jpg"),
    "https://cdn.example.test/gioi-thieu-muc-vu-giao-xu%20(2).jpg",
  );
});

test("toCdnMediaUrl leaves other URLs unchanged", () => {
  for (const url of [
    "",
    "https://cdn.example.test/a.webp",
    "/posts/slug",
    "see /api/media/file/a.jpg inline",
  ]) {
    assert.equal(toCdnMediaUrl(url), url);
  }
});

test("rewriteMediaUrls rewrites nested media URLs without mutating input", () => {
  const page = {
    id: "page-1",
    banners: [
      { id: "m1", url: "/api/media/file/banner.webp", alt: "Banner" },
      { id: "m2", url: "/api/media/file/clip.mp4", alt: "Video" },
    ],
    main: [
      {
        blockType: "postGroupBlock",
        posts: [
          {
            slug: "post-a",
            thumbnail: {
              url: "/api/media/file/thumb.jpg",
              thumbnailURL: "/api/media/file/thumb-80.jpg",
              sizes: { card: { url: "/api/media/file/thumb-card.jpg" } },
            },
          },
        ],
      },
      { blockType: "textBlock", content: "![x](/api/media/file/inline.jpg)" },
    ],
    count: 3,
    published: true,
    parent: null,
  };
  const snapshot = structuredClone(page);

  const result = rewriteMediaUrls(page);

  assert.deepEqual(page, snapshot);
  const [banner, video] = result.banners;
  const [postGroup, textBlock] = result.main;
  assert.equal(banner?.url, "https://cdn.example.test/banner.webp");
  assert.equal(video?.url, "https://cdn.example.test/clip.mp4");
  const thumbnail = postGroup?.posts?.[0]?.thumbnail;
  assert.ok(thumbnail);
  assert.equal(thumbnail.url, "https://cdn.example.test/thumb.jpg");
  assert.equal(thumbnail.thumbnailURL, "https://cdn.example.test/thumb-80.jpg");
  assert.equal(
    thumbnail.sizes.card.url,
    "https://cdn.example.test/thumb-card.jpg",
  );
  // Markdown bodies are free text; AppMarkdown transforms their images at render time.
  assert.equal(textBlock?.content, "![x](/api/media/file/inline.jpg)");
  assert.equal(result.count, 3);
  assert.equal(result.published, true);
  assert.equal(result.parent, null);

  const serialized = JSON.stringify({ ...result, main: [postGroup] });
  assert.ok(!serialized.includes(PROXY_PATH));
});

test("transformUrl output is the same for proxied and CDN URLs", () => {
  const proxied = "/api/media/file/banner.webp";
  assert.equal(
    transformUrl(toCdnMediaUrl(proxied), { width: "1280" }),
    transformUrl(proxied, { width: "1280" }),
  );
});
