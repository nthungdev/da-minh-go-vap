import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/prayer/meditation.md'

export default function PagePrayerMeditation() {
  const { title, hiddenTags } = attributes as PagePrayerMeditation

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
