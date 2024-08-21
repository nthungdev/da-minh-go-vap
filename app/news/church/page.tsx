import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/news/church.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PageNewsChurch() {
  const { title, hiddenTags } = attributes as PageNewsChurch
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
