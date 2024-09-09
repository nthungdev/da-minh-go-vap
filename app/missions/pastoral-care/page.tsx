import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/missions/pastoral-care.md'

export default function PageMissionsPastoralCare() {
  const { title, hiddenTags } = attributes as PageMissionsPastoralCare

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
