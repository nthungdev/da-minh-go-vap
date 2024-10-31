'use server'

import { getAllPosts } from '@/utils/post'
import Fuse from 'fuse.js'

const posts = getAllPosts()

const postFuse = new Fuse(posts, {
  keys: ['title'],
})

export const searchPosts = async (query: string) => {
  return postFuse.search(query)
}
