// import "server-only";

import { getPayload } from "payload";
import config from "@payload-config";
import { Locale } from "next-intl";
import { cache } from "react";
import { unstable_cache } from "next/cache";

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
    return page;
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
    return payload.findGlobal({ slug: "footer", locale, depth: 1 });
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
