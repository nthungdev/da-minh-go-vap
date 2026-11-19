"use server";

import { AppPost } from "@/definitions";
import { defaultLocale, Locale } from "@/i18n/config";
import { Post } from "@/payload-types";
import { rewriteMediaUrls } from "@/utils/cloudflare";
import { postToCardAppPost } from "@/utils/post";
import config from "@payload-config";
import Fuse from "fuse.js";
import { getPayload } from "payload";

export interface PostSearchResult {
  item: AppPost;
}

const POST_SEARCH_SELECT = {
  title: true,
  slug: true,
  shortBody: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  thumbnail: true,
  hiddenTags: true,
} as const;

/**
 * Strips Vietnamese diacritics and normalizes casing so queries like
 * "da minh" match titles like "Đa Minh".
 */
function normalizeVietnamese(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Searches published posts by title matching the search query for the given locale.
 * Uses Payload Local API with access control enforcement (`overrideAccess: false`),
 * fast per-token `like` filtering first, and diacritic-insensitive Fuse.js fuzzy
 * fallback/ranking so unaccented Vietnamese queries and minor typos still match.
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

  const targetLocale = locale ?? defaultLocale;
  const payload = await getPayload({ config });
  const nowIso = new Date().toISOString();

  // Fast path: DB-level per-token case-insensitive substring match
  const tokenConditions = tokens.map((token) => ({
    title: {
      like: token,
    },
  }));

  const directResult = await payload.find({
    collection: "posts",
    overrideAccess: false,
    depth: 1,
    select: POST_SEARCH_SELECT,
    where: {
      and: [
        {
          publishedAt: {
            less_than: nowIso,
          },
        },
        ...tokenConditions,
      ],
    },
    sort: "-publishedAt",
    limit: 100,
    locale: targetLocale,
  });

  // Fall back to a broader candidate pool when strict DB `like` finds nothing
  // (e.g. unaccented Vietnamese queries like "da minh" or minor typos).
  const usedFallback = directResult.docs.length === 0;
  const sourceDocs = usedFallback
    ? (
        await payload.find({
          collection: "posts",
          overrideAccess: false,
          depth: 1,
          select: POST_SEARCH_SELECT,
          where: {
            publishedAt: {
              less_than: nowIso,
            },
          },
          sort: "-publishedAt",
          limit: 500,
          locale: targetLocale,
        })
      ).docs
    : directResult.docs;

  const appPosts = sourceDocs.map((doc) =>
    postToCardAppPost(rewriteMediaUrls(doc as Post)),
  );

  if (appPosts.length === 0) {
    return [];
  }

  if (!usedFallback && appPosts.length === 1) {
    return appPosts.map((item) => ({ item }));
  }

  const fuse = new Fuse(appPosts, {
    keys: [
      {
        name: "title",
        getFn: (item) => normalizeVietnamese(item.title),
      },
    ],
    threshold: 0.6,
    ignoreLocation: true,
  });

  const scored = fuse.search(normalizeVietnamese(normalized));

  if (scored.length > 0) {
    return scored.slice(0, 20).map((r) => ({ item: r.item }));
  }

  // Only fall back to chronological order when the DB `like` filter already matched
  return usedFallback ? [] : appPosts.slice(0, 20).map((item) => ({ item }));
};
