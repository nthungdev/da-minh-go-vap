import config from "@payload-config";
import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { getPayload, type Where } from "payload";
import { defaultLocale } from "@/i18n/config";
import { PUBLISHED_CONTENT_REVALIDATE_SECONDS } from "@/utils/published-content-cache";
import { getSiteUrl } from "@/utils/url";

// Must stay a literal for Next segment config; keep equal to PUBLISHED_CONTENT_REVALIDATE_SECONDS
// so scheduled content appears without waiting on a CMS write.
export const revalidate = 60;

type SitemapDoc = { loc: string; updatedAt: string };

/** Matches what the public routes render: published and not behind HTTP basic auth. */
function publicWhere(): Where {
  return {
    publishedAt: { less_than: new Date().toISOString() },
    requireHttpBasicAuth: { not_equals: true },
  };
}

const getSitemapDocs = unstable_cache(
  async (): Promise<SitemapDoc[]> => {
    const payload = await getPayload({ config });
    const [pages, posts] = await Promise.all([
      payload.find({
        collection: "pages",
        where: publicWhere(),
        select: { path: true, updatedAt: true },
        pagination: false,
        depth: 0,
        locale: defaultLocale,
      }),
      payload.find({
        collection: "posts",
        where: { ...publicWhere(), slug: { exists: true } },
        select: { slug: true, updatedAt: true },
        sort: "-publishedAt",
        pagination: false,
        depth: 0,
        locale: defaultLocale,
      }),
    ]);

    const pageDocs = pages.docs.map((page) => ({
      loc: page.path,
      updatedAt: page.updatedAt,
    }));
    const postDocs = posts.docs
      .filter((post) => post.slug)
      .map((post) => ({
        loc: `/posts/${post.slug}`,
        updatedAt: post.updatedAt,
      }));

    return [...pageDocs, ...postDocs];
  },
  ["sitemap-docs"],
  {
    tags: ["pages", "posts"],
    revalidate: PUBLISHED_CONTENT_REVALIDATE_SECONDS,
  },
);

/**
 * Resolves a CMS path against the site origin. `URL` percent-encodes non-ASCII
 * characters but leaves existing `%XX` escapes alone, so paths are never double-encoded.
 */
function toAbsoluteUrl(path: string, baseUrl: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${baseUrl}/`).href;
}

/**
 * Generates sitemap.xml from public CMS pages and posts.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.SITE_NOINDEX === "true") return [];

  const baseUrl = getSiteUrl();
  const docs = await getSitemapDocs();

  return docs.map(({ loc, updatedAt }) => ({
    url: toAbsoluteUrl(loc, baseUrl),
    lastModified: updatedAt,
  }));
}
