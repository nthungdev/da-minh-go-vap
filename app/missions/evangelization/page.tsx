import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/missions/evangelization.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PageMissionsEvangelization() {
  const { title, hiddenTags } = attributes as PageMissionsEvangelization
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
