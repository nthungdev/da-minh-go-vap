import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/prayer/morning.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PagePrayerMorning() {
  const { title, hiddenTags } = attributes as PagePrayerMorning
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
