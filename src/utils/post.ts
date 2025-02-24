import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PostParams } from '@/definitions'

const postsDirectory = path.join(process.cwd(), 'src/content/posts')

// TODO update to use Payload
export const getPostBySlug = (slug: string) => {
  const filePath = path.join(postsDirectory, slug + '.md')
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { content, data } = matter(fileContents)
    return {
      slug,
      body: content,
      ...data,
    } as PostParams
  } catch (error) {
    console.error('Error reading file', { filePath, error })
    return null
  }
}

export const getPostsBySlugs = (slugs: string[]): PostParams[] => {
  return slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post !== null) as PostParams[]
}

// TODO update to use Payload
export const getAllPostSlugs = () => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map((fileName) => {
    return fileName.replace(/\.md$/, '')
  })
}

// TODO update to use Payload
export const getAllPosts = ({ limit = undefined }: { limit?: number } = {}) => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const filePath = path.join(postsDirectory, slug + '.md')
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { content, data } = matter(fileContents)
      return {
        slug,
        body: content,
        ...data,
      } as PostParams
    })
    .toSorted((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
}

export async function getPostsByHiddenTags(
  hiddenTags: string[],
  { limit = undefined }: { limit?: number } = {}
) {
  const payload = await getPayload({ config })
  const query = await payload.find({
    collection: 'posts',
  })
  const posts = query.docs.map((doc) => ({
    ...doc,
    publishedAt: new Date(doc.publishedAt),
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  }))
  return posts
    .filter((post) => {
      const postHiddenTags = new Set(
        post.hiddenTags
          // tag is a string when reference not found
          .filter((a) => typeof a !== 'string')
          .map((a) => a.tag)
      )
      return hiddenTags.some((tag) => postHiddenTags.has(tag))
    })
    .toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit)
}
