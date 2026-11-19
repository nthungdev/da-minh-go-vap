import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import { Locale } from "@/i18n/config";
import { resolveSearchTagOptions, SearchTagOption } from "@/utils/search";

const getSearchTagsCached = unstable_cache(
  async (locale: Locale): Promise<SearchTagOption[]> => {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "searchTags",
      where: {
        enabled: { equals: true },
      },
      sort: "order",
      depth: 1,
      limit: 50,
      locale,
    });
    return resolveSearchTagOptions(result.docs);
  },
  ["search-tags"],
  { tags: ["searchTags", "hiddenTags"], revalidate: 300 },
);

/**
 * Fetches enabled search tag options configured in Payload CMS for the given locale.
 */
export const getSearchTags = cache(
  async (locale: Locale): Promise<SearchTagOption[]> => {
    try {
      return await getSearchTagsCached(locale);
    } catch (error) {
      console.error("Failed to fetch search tags:", error);
      return [];
    }
  },
);
