import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/prayer/evening.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PagePrayerEvening() {
  const { title, hiddenTags } = attributes as PagePrayerEvening
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
