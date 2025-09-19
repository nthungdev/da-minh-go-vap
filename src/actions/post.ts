"use server";

import { Config } from "@/payload-types";
import { postToAppPost } from "@/utils/post";
import * as postUtils from "@/utils/post-server";

/**
 * @param slug Slug of the post
 * @returns PostParams object or null if the post is not published yet or not found
 */
export const fetchPostBySlug = async (
  slug: string,
  { locale }: { locale?: Config["locale"] } = {},
) => {
  const post = await postUtils.getPostBySlug(slug, { locale });
  return post;
};

export const fetchPostsBySlugs = async (
  slugs: string[],
  { locale }: { locale?: Config["locale"] } = {},
) => {
  const posts = await postUtils.getPostsBySlugs(slugs, { locale });
  return posts;
};

export async function fetchAllPosts({
  limit = undefined,
  locale,
}: { limit?: number; locale?: Config["locale"] } = {}) {
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
  };
};
