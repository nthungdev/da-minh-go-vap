import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/prayer/evening.md'

export default function PagePrayerEvening() {
  const { title, hiddenTags } = attributes as PagePrayerEvening

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
