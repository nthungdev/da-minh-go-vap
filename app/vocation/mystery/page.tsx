import AppPostsPage from '@/components/app-posts-page'
import { getPostsByHiddenTags } from '@/utils/posts'
import { attributes } from '@/content/pages/vocation/mystery.md'

export default function PageVocationMystery() {
  const { title, hiddenTags } = attributes as PageVocationMystery
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
