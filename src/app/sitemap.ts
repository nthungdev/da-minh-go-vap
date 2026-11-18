import type { MetadataRoute } from "next";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { defaultLocale } from "@/i18n/config";
import { getSiteUrl } from "@/utils/url";
import { PUBLISHED_CONTENT_REVALIDATE_SECONDS } from "@/utils/published-content-cache";

export const revalidate = 3600;

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
 * Generates sitemap.xml from public CMS pages and posts.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.SITE_NOINDEX === "true") return [];

  const baseUrl = getSiteUrl();
  const docs = await getSitemapDocs();

  return docs.map(({ loc, updatedAt }) => ({
    url: `${baseUrl}${encodeURI(loc)}`,
    lastModified: updatedAt,
  }));
}
