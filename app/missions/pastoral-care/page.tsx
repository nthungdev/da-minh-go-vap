import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/missions/pastoral-care.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PageMissionsPastoralCare() {
  const { title, hiddenTags } = attributes as PageMissionsPastoralCare
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
