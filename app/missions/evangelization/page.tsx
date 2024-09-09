import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/missions/evangelization.md'

export default function PageMissionsEvangelization() {
  const { title, hiddenTags } = attributes as PageMissionsEvangelization

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
