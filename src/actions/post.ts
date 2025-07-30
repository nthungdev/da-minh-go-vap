"use server";

import * as postUtils from "@/utils/post";

/**
 * @param slug Slug of the post
 * @returns PostParams object or null if the post is not published yet or not found
 */
export const fetchPostBySlug = async (slug: string) => {
  const post = await postUtils.getPostBySlug(slug);
  if (!post) {
    return null;
  }
  return post.publishedAt < new Date() ? post : null;
};

export const fetchPostsBySlugs = async (slugs: string[]) => {
  const posts = await postUtils.getPostsBySlugs(slugs);
  return posts.filter((post) => post.publishedAt < new Date());
};

export async function fetchAllPosts({
  limit = undefined,
}: { limit?: number } = {}) {
  const query = await postUtils.queryAllPosts({ limit });
  const posts = query.docs
    .map(postUtils.postToAppPost)
    .filter((post) => !!post.slug);
  return posts.filter((post) => post.publishedAt < new Date()).slice(0, limit);
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
  const posts = query.docs.map(postUtils.postToAppPost);
  return {
    posts,
    hasMore: query.hasNextPage,
  };
};
