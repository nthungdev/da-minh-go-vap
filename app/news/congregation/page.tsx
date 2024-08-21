import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/news/congregation.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PageNewsCongregation() {
  const { title, hiddenTags } = attributes as PageNewsCongregation
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
