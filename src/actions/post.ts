"use server";

import { postToAppPost } from "@/utils/post";
import * as postUtils from "@/utils/post-server";

/**
 * @param slug Slug of the post
 * @returns PostParams object or null if the post is not published yet or not found
 */
export const fetchPostBySlug = async (slug: string) => {
  const post = await postUtils.getPostBySlug(slug);
  return post;
};

export const fetchPostsBySlugs = async (slugs: string[]) => {
  const posts = await postUtils.getPostsBySlugs(slugs);
  return posts;
};

export async function fetchAllPosts({
  limit = undefined,
}: { limit?: number } = {}) {
  const query = await postUtils.queryAllPosts({ limit });
  const posts = query.docs.map(postToAppPost).filter((post) => !!post.slug);
  return posts;
}

export const fetchPostsByHiddenTags = async (
  hiddenTags: string[],
  {
    limit,
    skipSlug,
    page = 1,
  }: Parameters<typeof postUtils.queryPostsByHiddenTags>[1] = {},
) => {
  const query = await postUtils.queryPostsByHiddenTags(hiddenTags, {
    limit,
    page,
    skipSlug,
  });
  const posts = query.docs.map(postToAppPost);
  return {
    posts,
    hasMore: query.hasNextPage,
  };
};
