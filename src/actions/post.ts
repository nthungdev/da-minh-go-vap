'use server'

import * as postUtils from '@/utils/post'

/**
 * @param slug Slug of the post
 * @returns PostParams object or null if the post is not published yet or not found
 */
export const fetchPostBySlug = async (slug: string) => {
  const post = postUtils.getPostBySlug(slug)
  if (!post) {
    return null
  }
  return post.date < new Date() ? post : null
}

export const fetchPostsBySlugs = async (slugs: string[]) => {
  const posts = postUtils.getPostsBySlugs(slugs)
  return posts.filter((post) => post.date < new Date())
}

export const fetchAllPosts = async ({
  limit = undefined,
}: { limit?: number } = {}) => {
  const posts = postUtils.getAllPosts()
  return posts.filter((post) => post.date < new Date()).slice(0, limit)
}

export const fetchPostsByHiddenTags = async (
  hiddenTags: string[],
  {
    limit,
    offset = undefined,
    skipSlug,
  }: { limit?: number; offset?: number; skipSlug?: string } = {}
) => {
  const posts = postUtils.getPostsByHiddenTags(hiddenTags)
  const plus1 = posts
    .filter((post) => post.date < new Date())
    .filter((post) => post.slug !== skipSlug)
    .slice(offset || 0, limit ? limit + 1 : undefined)
  const results = limit ? plus1.slice(0, limit) : plus1
  return {
    posts: results,
    hasMore: plus1.length > results.length,
  }
}
