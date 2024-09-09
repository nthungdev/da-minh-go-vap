import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/prayer/morning.md'

export default function PagePrayerMorning() {
  const { title, hiddenTags } = attributes as PagePrayerMorning

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
