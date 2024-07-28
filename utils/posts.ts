import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export const getPostBySlug = (slug: string) => {
  const filePath = path.join(postsDirectory, slug + '.md')
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { content, data } = matter(fileContents)
  return {
    slug,
    body: content,
    ...data,
  } as PostParams
}

export const getAllPostSlugs = () => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map(fileName => {
    return fileName.replace(/\.md$/, '')
  })
}

export const getAllPosts = () => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map(fileName => {
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
}