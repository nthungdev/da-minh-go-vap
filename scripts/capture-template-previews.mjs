/**
 * Regenerates the post template thumbnails shown in the Payload block picker
 * (public/images/template-previews/<template>.webp).
 *
 * Needs a running app (`pnpm dev`) with at least one published template post
 * per template, and Google Chrome installed (or CHROME_PATH set).
 *
 * Usage: pnpm previews:capture [baseUrl]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const outDir = path.resolve("public/images/template-previews");

// Payload renders block thumbnails at 3:2 with object-fit: cover.
const VIEWPORT_WIDTH = 1200;
const OUTPUT_WIDTH = 600;
const OUTPUT_HEIGHT = 400;
const EMBED_PAINT_MS = 3000;

/** gospelReflectionSplit -> gospel-reflection-split, catechismQASeries -> catechism-qa-series */
const toFileName = (blockType) =>
  blockType
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const query = new URLSearchParams({
  "where[contentMode][equals]": "template",
  limit: "200",
  depth: "0",
  sort: "-publishedAt",
});
const res = await fetch(`${baseUrl}/api/posts?${query}`).catch((error) => {
  throw new Error(`Cannot reach ${baseUrl}; is the app running?`, {
    cause: error,
  });
});
if (!res.ok) throw new Error(`GET /api/posts failed: ${res.status}`);
const { docs } = await res.json();

// Newest post per template.
const slugByTemplate = new Map();
for (const post of docs) {
  const blockType = post.template?.[0]?.blockType;
  // blockType becomes a file name and a CSS selector; accept only identifiers.
  if (!/^[a-zA-Z0-9]+$/.test(blockType ?? "")) continue;
  if (!slugByTemplate.has(blockType)) {
    slugByTemplate.set(blockType, post.slug);
  }
}
if (slugByTemplate.size === 0)
  throw new Error("No published template posts found");

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chrome" },
);
const page = await browser.newPage({
  viewport: { width: VIEWPORT_WIDTH, height: 900 },
  deviceScaleFactor: 1,
});
// Dev builds compile each route on first visit.
page.setDefaultTimeout(120_000);

// Embeds (YouTube, Spotify) can keep the network busy; don't fail on them.
const settle = () =>
  page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});

try {
  for (const [blockType, slug] of slugByTemplate) {
    await page.goto(`${baseUrl}/posts/${encodeURIComponent(slug)}`, {
      waitUntil: "load",
    });
    const template = page.locator(`[data-post-template="${blockType}"]`);
    await template.waitFor();

    // The site header is sticky and would cover the top of the crop.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("body *")) {
        const { position } = getComputedStyle(el);
        if (position === "fixed" || position === "sticky") {
          el.style.visibility = "hidden";
        }
      }
    });

    const size = await template.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });
    const cropHeight = Math.round((size.width * OUTPUT_HEIGHT) / OUTPUT_WIDTH);
    // Short templates are shown whole and padded to 3:2 below.
    const fitsWhole = size.height < cropHeight;
    const height = fitsWhole ? Math.ceil(size.height) : cropHeight;

    // Shoot the viewport, not the full page: Chromium leaves cross-origin
    // embeds (YouTube, Spotify) blank in full-page captures.
    await page.setViewportSize({
      width: VIEWPORT_WIDTH,
      height: Math.max(900, height + 40),
    });
    await template.evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY),
    );
    await settle();
    // Video/podcast embeds paint a while after their frame loads.
    await Promise.all(
      page
        .frames()
        .map((frame) => frame.waitForLoadState("load").catch(() => {})),
    );
    await page.waitForTimeout(EMBED_PAINT_MS);

    // Viewport coordinates after scrolling (the page may not scroll all the way).
    const box = await template.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width };
    });
    const png = await page.screenshot();
    const cropped = await sharp(png)
      .extract({
        left: Math.round(box.left),
        top: Math.round(box.top),
        width: Math.round(box.width),
        height,
      })
      .toBuffer();
    const file = path.join(outDir, `${toFileName(blockType)}.webp`);
    await sharp(cropped)
      .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, {
        fit: fitsWhole ? "contain" : "cover",
        position: fitsWhole ? "centre" : "top",
        background: "#ffffff",
      })
      .webp({ quality: 80 })
      .toFile(file);
    console.log(
      `${blockType} <- /posts/${slug} -> ${path.relative(process.cwd(), file)}`,
    );
  }
} finally {
  await browser.close();
}
