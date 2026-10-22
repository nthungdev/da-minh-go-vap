"use server";

import config from "@payload-config";
import { defaultLocale, Locale } from "@/i18n/config";
import { AppPost } from "@/definitions";
import { postToAppPost } from "@/utils/post";
import * as postUtils from "@/utils/post-server";
import { getPayload } from "payload";

/**
 * @param slug Slug of the post
 * @returns PostParams object or null if the post is not published yet or not found
 */
export const fetchPostBySlug = async (
  slug: string,
  { locale }: { locale?: Locale } = {},
) => {
  const post = await postUtils.getPostBySlug(slug, { locale });
  return post;
};

/**
 * Fetches multiple published posts by their slugs in a single batched query,
 * preserving the order of the input slugs and omitting unpublished/missing posts.
 *
 * @param slugs - Array of post slugs to fetch.
 * @param options - Locale options.
 * @returns Array of published posts matching the requested slugs.
 */
export const fetchPostsBySlugs = async (
  slugs: string[],
  { locale }: { locale?: Locale } = {},
) => {
  if (slugs.length === 0) {
    return [];
  }

  try {
    const payload = await getPayload({ config });
    const uniqueSlugs = Array.from(new Set(slugs));
    const query = await payload.find({
      collection: "posts",
      where: {
        slug: { in: uniqueSlugs },
        // Only get published posts
        publishedAt: {
          less_than: new Date().toISOString(),
        },
      },
      limit: uniqueSlugs.length,
      pagination: false,
      locale: locale ?? defaultLocale,
    });

    const postMap = new Map<string, AppPost>();
    for (const doc of query.docs) {
      if (doc.slug) {
        try {
          postMap.set(doc.slug, postToAppPost(doc));
        } catch {
          // Skip malformed document without dropping the entire batch
        }
      }
    }

    // Preserve the requested order of slugs while omitting missing or unpublished posts
    return slugs
      .map((slug) => postMap.get(slug))
      .filter((post): post is AppPost => post !== undefined);
  } catch {
    return [];
  }
};

export async function fetchAllPosts({
  limit = undefined,
  locale,
}: { limit?: number; locale?: Locale } = {}) {
  const query = await postUtils.queryAllPosts({ limit, locale });
  const posts = query.docs.map(postToAppPost).filter((post) => !!post.slug);
  return posts;
}

export const fetchPostsByHiddenTags = async (
  hiddenTags: string[],
  {
    limit,
    skipSlug,
    page = 1,
    locale,
  }: Parameters<typeof postUtils.queryPostsByHiddenTags>[1] = {},
) => {
  const query = await postUtils.queryPostsByHiddenTags(hiddenTags, {
    limit,
    page,
    skipSlug,
    locale,
  });

  const posts = query.docs.map(postToAppPost);
  return {
    posts,
    hasMore: query.hasNextPage,
    // we can ensure page is not undefined because we are using pagination (by default)
    page: query.page!,
    totalPages: query.totalPages,
  };
};

/**
 * Fetches the public hidden tag document for a tag value.
 */
export const fetchPublicTagByTag = async (tag: string) => {
  return postUtils.getPublicHiddenTagByTag(tag);
};

/**
 * Fetches paginated posts for a public tag and formats the result for the app.
 */
export const fetchPostsByPublicTag = async (
  tag: string,
  options: Parameters<typeof postUtils.queryPostsByPublicTag>[1] = {},
) => {
  const result = await postUtils.queryPostsByPublicTag(tag, options);

  if (!result) {
    return null;
  }

  const posts = result.query.docs.map(postToAppPost);
  return {
    tag: result.tag,
    posts,
    hasMore: result.query.hasNextPage,
    page: result.query.page!,
    totalPages: result.query.totalPages,
  };
};
