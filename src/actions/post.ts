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
  const posts = (await postUtils.getAllPosts()).filter((post) => !!post.slug);
  return posts.filter((post) => post.publishedAt < new Date()).slice(0, limit);
}

export const fetchPostsByHiddenTags = async (
  hiddenTags: string[],
  {
    limit,
    offset = undefined,
    skipSlug,
  }: { limit?: number; offset?: number; skipSlug?: string } = {},
) => {
  const posts = await postUtils.getPostsByHiddenTags(hiddenTags);
  const plus1 = posts
    .filter((post) => post.publishedAt < new Date())
    .filter((post) => post.slug !== skipSlug)
    .slice(offset || 0, limit ? limit + 1 : undefined);
  const results = limit ? plus1.slice(0, limit) : plus1;
  return {
    posts: results,
    hasMore: plus1.length > results.length,
  };
};
