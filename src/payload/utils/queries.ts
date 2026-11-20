// import "server-only";

import config from "@payload-config";
import { unstable_cache } from "next/cache";
import type { Locale } from "next-intl";
import { getPayload } from "payload";
import { cache } from "react";
import { rewriteMediaUrls } from "@/utils/cloudflare";

const getPageByPathCached = unstable_cache(
  async (path: string, locale: Locale) => {
    const payload = await getPayload({ config });
    const query = await payload.find({
      collection: "pages",
      depth: 2,
      where: {
        path: { equals: path },
      },
      locale,
    });
    const page = query.docs[0] ?? null;
    return rewriteMediaUrls(page);
  },
  ["page-by-path"],
  { tags: ["pages"], revalidate: 300 },
);

export const getPageByPath = cache(async (path: string, locale: Locale) => {
  return getPageByPathCached(path, locale);
});

const getFooterCached = unstable_cache(
  async (locale: Locale) => {
    const payload = await getPayload({ config });
    const footer = await payload.findGlobal({
      slug: "footer",
      locale,
      depth: 1,
    });
    return rewriteMediaUrls(footer);
  },
  ["footer-global"],
  { tags: ["globals", "footer"], revalidate: 300 },
);

/**
 * Fetches the cached Footer global configuration for the specified locale.
 */
export const getFooter = cache(async (locale: Locale) => {
  return getFooterCached(locale);
});
