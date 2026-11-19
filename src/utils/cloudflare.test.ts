import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { transformUrl } from "./cloudflare.ts";

describe("transformUrl", () => {
  let originalCdnUrl: string | undefined;
  let originalMediaCdnUrl: string | undefined;

  beforeEach(() => {
    originalCdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
    originalMediaCdnUrl = process.env.NEXT_PUBLIC_MEDIA_CDN_URL;
    delete process.env.NEXT_PUBLIC_CDN_URL;
    delete process.env.NEXT_PUBLIC_MEDIA_CDN_URL;
  });

  afterEach(() => {
    if (originalCdnUrl === undefined) {
      delete process.env.NEXT_PUBLIC_CDN_URL;
    } else {
      process.env.NEXT_PUBLIC_CDN_URL = originalCdnUrl;
    }
    if (originalMediaCdnUrl === undefined) {
      delete process.env.NEXT_PUBLIC_MEDIA_CDN_URL;
    } else {
      process.env.NEXT_PUBLIC_MEDIA_CDN_URL = originalMediaCdnUrl;
    }
  });
  it("safeguards against null, undefined, empty, or whitespace-only inputs", () => {
    assert.equal(transformUrl(null), "");
    assert.equal(transformUrl(undefined), "");
    assert.equal(transformUrl(""), "");
    assert.equal(transformUrl("   "), "");
    // @ts-expect-error non-string input safeguard
    assert.equal(transformUrl(12345), "");
  });

  it("passes through data URIs and blob URIs safely", () => {
    const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";
    const blobUri = "blob:https://example.com/uuid-1234";
    assert.equal(transformUrl(dataUri), dataUri);
    assert.equal(transformUrl(blobUri), blobUri);
  });

  it("passes through SVGs safely without mangling", () => {
    assert.equal(transformUrl("/logo.svg"), "/logo.svg");
    assert.equal(
      transformUrl("https://cdn.dongdaminhgovap.org/media/logo.svg"),
      "https://cdn.dongdaminhgovap.org/media/logo.svg",
    );
    assert.equal(
      transformUrl("https://cdn.dongdaminhgovap.org/media/logo.SVG?v=1#icon"),
      "https://cdn.dongdaminhgovap.org/media/logo.SVG?v=1#icon",
    );
    assert.equal(
      transformUrl("https://example.com/vector.svg"),
      "https://example.com/vector.svg",
    );
  });

  it("passes through external non-CDN URLs without mangling", () => {
    const external = "https://images.unsplash.com/photo-123?w=800";
    assert.equal(transformUrl(external), external);
    const externalHttp = "http://example.com/banner.jpg";
    assert.equal(transformUrl(externalHttp), externalHttp);
  });

  it("retains full relative pathname instead of filename only", () => {
    assert.equal(
      transformUrl("/media/2024/05/photo.jpg"),
      "https://cdn.dongdaminhgovap.org/cdn-cgi/image/format=auto,quality=85,onerror=redirect/media/2024/05/photo.jpg",
    );
    assert.equal(
      transformUrl("media/subfolder/nested/image.png", { width: 400 }),
      "https://cdn.dongdaminhgovap.org/cdn-cgi/image/format=auto,quality=85,onerror=redirect,width=400/media/subfolder/nested/image.png",
    );
    assert.equal(
      transformUrl("single-file.webp", { width: "100", quality: "90" }),
      "https://cdn.dongdaminhgovap.org/cdn-cgi/image/format=auto,quality=90,onerror=redirect,width=100/single-file.webp",
    );
  });

  it("transforms same-origin CDN URLs and preserves full path", () => {
    assert.equal(
      transformUrl("https://cdn.dongdaminhgovap.org/media/posts/cover.jpg", {
        width: 600,
      }),
      "https://cdn.dongdaminhgovap.org/cdn-cgi/image/format=auto,quality=85,onerror=redirect,width=600/media/posts/cover.jpg",
    );
  });

  it("re-transforms already transformed Cloudflare URLs cleanly", () => {
    const alreadyTransformed =
      "https://cdn.dongdaminhgovap.org/cdn-cgi/image/width=300,onerror=redirect/media/banner.jpg";
    assert.equal(
      transformUrl(alreadyTransformed, { width: 800 }),
      "https://cdn.dongdaminhgovap.org/cdn-cgi/image/format=auto,quality=85,onerror=redirect,width=800/media/banner.jpg",
    );
  });

  it("strips Payload proxy prefix and preserves query strings with slashes", () => {
    assert.equal(
      transformUrl("/api/media/file/banner.webp?v=1/2", { width: 800 }),
      "https://cdn.dongdaminhgovap.org/cdn-cgi/image/format=auto,quality=85,onerror=redirect,width=800/banner.webp?v=1/2",
    );
  });

  it("supports NEXT_PUBLIC_CDN_URL environment variable override", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://custom-cdn.example.com/";
    assert.equal(
      transformUrl("/media/header.jpg", { width: 500 }),
      "https://custom-cdn.example.com/cdn-cgi/image/format=auto,quality=85,onerror=redirect,width=500/media/header.jpg",
    );
    assert.equal(
      transformUrl("https://custom-cdn.example.com/media/header.jpg", {
        width: 500,
      }),
      "https://custom-cdn.example.com/cdn-cgi/image/format=auto,quality=85,onerror=redirect,width=500/media/header.jpg",
    );
  });
});
