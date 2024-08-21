import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/news/vietnam-church.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PageNewsVietnamChurch() {
  const { title, hiddenTags } = attributes as PageNewsVietnamChurch
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
