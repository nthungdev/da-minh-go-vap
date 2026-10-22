"use server";

import config from "@payload-config";
import Fuse from "fuse.js";
import { getPayload } from "payload";
import { defaultLocale, Locale } from "@/i18n/config";
import { postToAppPost } from "@/utils/post";
import { AppPost } from "@/definitions";

export interface PostSearchResult {
  item: AppPost;
}

/**
 * Searches published posts by title matching the search query for the given locale.
 * Uses Payload Local API with access control enforcement (`overrideAccess: false`)
 * and per-token title matching (`like`), followed by Fuse.js relevance ranking over
 * the matched candidates.
 *
 * @param query - The user search string.
 * @param options - Optional locale setting (defaults to defaultLocale).
 * @returns Ranked array of matching post search results.
 */
export const searchPosts = async (
  query: string,
  { locale }: { locale?: Locale } = {},
): Promise<PostSearchResult[]> => {
  const trimmed = query?.trim() ?? "";
  if (!trimmed) {
    return [];
  }

  const normalized = trimmed.replace(/\s+/g, " ");
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) {
    return [];
  }

  const payload = await getPayload({ config });

  // Each word token in the query must match in the post title
  const tokenConditions = tokens.map((token) => ({
    title: {
      like: token,
    },
  }));

  // Query database for posts matching all tokens with collection access control enforced
  const result = await payload.find({
    collection: "posts",
    overrideAccess: false,
    where: {
      and: [
        {
          publishedAt: {
            less_than: new Date().toISOString(),
          },
        },
        ...tokenConditions,
      ],
    },
    sort: "-publishedAt",
    limit: 100,
    locale: locale ?? defaultLocale,
  });

  const appPosts = result.docs.map((doc) => postToAppPost(doc));

  if (appPosts.length <= 1) {
    return appPosts.map((item) => ({ item }));
  }

  // Rank matching candidates by relevance using Fuse
  const fuse = new Fuse(appPosts, {
    keys: ["title"],
    threshold: 0.6,
  });

  const scored = fuse.search(normalized);

  // Return Fuse relevance-ranked items, falling back to chronological order
  // if Fuse filtered all candidates out.
  const ranked =
    scored.length > 0
      ? scored.map((r) => ({ item: r.item }))
      : appPosts.map((item) => ({ item }));

  return ranked.slice(0, 20);
};
