'use server'

import * as postUtils from '@/utils/posts'

/**
 * @param slug Slug of the post
 * @returns PostParams object or null if the post is not published yet or not found
 */
export const fetchPostBySlug = async (slug: string) => {
  const post = postUtils.getPostBySlug(slug)
  return post.date < new Date() ? post : null
}

export const fetchPostsBySlugs = async (slugs: string[]) => {
  const posts = postUtils.getPostsBySlugs(slugs)
  return posts.filter((post) => post.date < new Date())
}

export const fetchAllPosts = async ({
  limit = undefined,
}: { limit?: number } = {}) => {
  const posts = postUtils.getAllPosts({ limit })
  return posts.filter((post) => post.date < new Date())
}

export const fetchPostsByHiddenTags = async (
  hiddenTags: string[],
  { limit = undefined }: { limit?: number } = {}
) => {
  const posts = postUtils.getPostsByHiddenTags(hiddenTags, { limit })
  return posts.filter((post) => post.date < new Date())
}
