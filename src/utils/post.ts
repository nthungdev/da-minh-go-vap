import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src/content/posts')

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

export const getAllPostSlugs = () => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map((fileName) => {
    return fileName.replace(/\.md$/, '')
  })
}

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

export const getPostsByHiddenTags = (
  hiddenTags: string[],
  { limit = undefined }: { limit?: number } = {}
) => {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = fileNames.map((fileName) => {
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
  return allPosts
    .filter((post) => {
      const postHiddenTags = new Set(post.hiddenTags)
      return hiddenTags.some((tag) => postHiddenTags.has(tag))
    })
    .toSorted((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
}
