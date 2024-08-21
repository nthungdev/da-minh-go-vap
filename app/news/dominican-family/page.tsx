import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/news/dominican-family.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PageNewsDominicanFamily() {
  const { title, hiddenTags } = attributes as PageNewsDominicanFamily
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
