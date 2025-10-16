"use server";

import { Locale } from "@/i18n/config";
import { postToAppPost } from "@/utils/post";
import * as postUtils from "@/utils/post-server";

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

export const fetchPostsBySlugs = async (
  slugs: string[],
  { locale }: { locale?: Locale } = {},
) => {
  const posts = await Promise.all(
    slugs.map((slug) => fetchPostBySlug(slug, { locale })),
  );
  return posts.filter((p) => p !== null);
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
